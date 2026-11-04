import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { Client } from "@/models/Client";
import { requireAuth } from "@/lib/authMiddleware";
import mongoose from "mongoose";

// Generar número secuencial correlativo para la venta (ej: VNT-202611-0001)
async function generateSaleNumber(): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `VNT-${yearMonth}-`;

  const lastSale = await Sale.findOne({
    saleNumber: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastSale && lastSale.saleNumber) {
    const parts = lastSale.saleNumber.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

// GET /api/sales - Listar ventas con filtros
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filter: any = {};

    if (search) {
      filter.$or = [
        { saleNumber: { $regex: search, $options: "i" } },
        { recipientName: { $regex: search, $options: "i" } },
        { deliveryAddress: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const sales = await Sale.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      sales,
      count: sales.length,
    });
  } catch (error: any) {
    console.error("Error en GET /api/sales:", error);
    return NextResponse.json(
      { error: "Error al listar las ventas" },
      { status: 500 }
    );
  }
}

// POST /api/sales - Registrar una nueva venta y descontar stock con control de concurrencia (__v)
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await req.json();
    const {
      clientId,
      newClient,
      recipientName,
      deliveryAddress,
      items,
      paymentMethod,
      notes,
      taxRate = 0,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un producto en la venta" },
        { status: 400 }
      );
    }

    let clientDoc: any = null;

    // 1. Obtener o crear el cliente
    if (newClient) {
      const { documentId, name, phone, address } = newClient;
      if (!documentId || !name) {
        return NextResponse.json(
          { error: "El documento/identificación y nombre son obligatorios para el nuevo cliente" },
          { status: 400 }
        );
      }

      const cleanDoc = String(documentId).trim().toUpperCase();
      let existing = await Client.findOne({ documentId: cleanDoc });

      if (existing) {
        clientDoc = existing;
      } else {
        clientDoc = await Client.create({
          documentId: cleanDoc,
          name: String(name).trim(),
          phone: phone ? String(phone).trim() : "",
          address: address ? String(address).trim() : "",
          isActive: true,
        });
      }
    } else if (clientId) {
      clientDoc = await Client.findById(clientId);
      if (!clientDoc) {
        return NextResponse.json({ error: "Cliente seleccionado no encontrado" }, { status: 404 });
      }
      if (!clientDoc.isActive) {
        return NextResponse.json(
          { error: "El cliente seleccionado se encuentra inactivo o dado de baja" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Debe seleccionar un cliente existente o proporcionar los datos para crearlo" },
        { status: 400 }
      );
    }

    const finalRecipient = recipientName?.trim() || clientDoc.name;
    const finalAddress =
      deliveryAddress?.trim() || clientDoc.address || "Entrega en tienda / almacén";

    // 2. Validar productos y descontar stock usando save() con versionKey
    const processedItems: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const { productId, quantity } = item;
      const qty = Number(quantity);

      if (!productId || isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { error: "Cada ítem debe tener un producto válido y cantidad mayor a cero" },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: `Producto con ID ${productId} no fue encontrado` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `El producto "${product.name}" (${product.sku}) está inactivo` },
          { status: 400 }
        );
      }

      if (product.stock < qty) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para "${product.name}". Solicitado: ${qty}, Disponible: ${product.stock}`,
          },
          { status: 400 }
        );
      }

      const itemSubtotal = product.price * qty;
      calculatedSubtotal += itemSubtotal;

      processedItems.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        quantity: qty,
        unitPrice: product.price,
        unit: product.unit,
        subtotal: itemSubtotal,
      });

      // Descontar inventario e incrementar versión de concurrencia
      product.stock -= qty;
      product.increment(); // fuerza incremento de __v en la actualización
      await product.save();
    }

    // 3. Totales
    const tax = calculatedSubtotal * (Number(taxRate) / 100);
    const total = calculatedSubtotal + tax;
    const saleNumber = await generateSaleNumber();

    // 4. Crear venta
    const newSale = await Sale.create({
      saleNumber,
      clientId: clientDoc._id,
      recipientName: finalRecipient,
      deliveryAddress: finalAddress,
      items: processedItems,
      subtotal: calculatedSubtotal,
      tax,
      total,
      paymentMethod: paymentMethod || "efectivo",
      status: "completada",
      userId: new mongoose.Types.ObjectId(auth.user!.userId),
      notes: notes ? String(notes).trim() : "",
    });

    return NextResponse.json(
      {
        message: "Venta registrada exitosamente",
        sale: newSale,
        createdClient: newClient ? clientDoc : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en POST /api/sales:", error);
    if (error.name === "VersionError") {
      return NextResponse.json(
        {
          error:
            "Conflicto de concurrencia en inventario: uno de los productos fue modificado simultáneamente por otro usuario. Por favor recarga e intenta de nuevo.",
          code: "VERSION_CONFLICT",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Error al procesar la venta" },
      { status: 500 }
    );
  }
}
