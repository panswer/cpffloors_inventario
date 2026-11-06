import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { Client } from "@/models/Client";
import { requireAuth } from "@/lib/authMiddleware";
import { logger } from "@/lib/logger";
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

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 50) : 10;

    const pageParam = searchParams.get("page");
    const page = Math.max(parseInt(pageParam || "1", 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [sales, totalCount] = await Promise.all([
      Sale.find(filter)
        .select("-items") // Excluye el detalle de productos en la lista general de ventas
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      sales,
      count: totalCount,
      page,
      limit,
      totalPages,
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
  let session: mongoose.ClientSession | null = null;
  const mutatedProducts: Array<{ product: any; prevStock: number }> = [];
  let createdClientDoc: any = null;

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

    // Intentar iniciar sesión de transacción (si MongoDB soporta ReplicaSet)
    let useTransaction = false;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch {
      // Si MongoDB corre como Standalone sin replica set, se gestionará rollback manual
      session = null;
      useTransaction = false;
    }

    let clientDoc: any = null;

    // 1. Obtener o crear el cliente
    if (newClient) {
      const { documentId, name, phone, address } = newClient;
      if (!documentId || !name) {
        if (useTransaction && session) await session.abortTransaction();
        return NextResponse.json(
          { error: "El documento/identificación y nombre son obligatorios para el nuevo cliente" },
          { status: 400 }
        );
      }

      const cleanDoc = String(documentId).trim().toUpperCase();
      let existing = await Client.findOne({ documentId: cleanDoc }).session(session);

      if (existing) {
        clientDoc = existing;
      } else {
        const created = await Client.create(
          [
            {
              documentId: cleanDoc,
              name: String(name).trim(),
              phone: phone ? String(phone).trim() : "",
              address: address ? String(address).trim() : "",
              isActive: true,
            },
          ],
          session ? { session } : {}
        );
        clientDoc = created[0];
        createdClientDoc = clientDoc;
      }
    } else if (clientId) {
      clientDoc = await Client.findById(clientId).session(session);
      if (!clientDoc) {
        if (useTransaction && session) await session.abortTransaction();
        return NextResponse.json({ error: "Cliente seleccionado no encontrado" }, { status: 404 });
      }
      if (!clientDoc.isActive) {
        if (useTransaction && session) await session.abortTransaction();
        return NextResponse.json(
          { error: "El cliente seleccionado se encuentra inactivo o dado de baja" },
          { status: 400 }
        );
      }
    } else {
      if (useTransaction && session) await session.abortTransaction();
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
        throw new Error("Cada ítem debe tener un producto válido y cantidad mayor a cero");
      }

      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new Error(`Producto con ID ${productId} no fue encontrado`);
      }

      if (!product.isActive) {
        throw new Error(`El producto "${product.name}" (${product.sku}) está inactivo`);
      }

      if (product.stock < qty) {
        throw new Error(
          `Stock insuficiente para "${product.name}". Solicitado: ${qty}, Disponible: ${product.stock}`
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
      const prevStock = product.stock;
      product.stock -= qty;
      product.increment(); // fuerza incremento de __v en la actualización

      if (session) {
        await product.save({ session });
      } else {
        await product.save();
        // Guardar para posible rollback compensatorio si no hay réplica
        mutatedProducts.push({ product, prevStock });
      }

      // Log de salida de inventario por venta
      logger.info(`Salida de inventario por venta: ${qty}x ${product.name}`, {
        eventType: "inventory_movement",
        movementType: "out",
        reason: "sale_dispatch",
        productId: product._id.toString(),
        sku: product.sku,
        productName: product.name,
        category: product.category,
        quantity: qty,
        unit: product.unit,
        previousStock: prevStock,
        currentStock: product.stock,
        recipientName: finalRecipient,
        userId: auth.user!.userId,
        username: auth.user!.username,
      }, "inventory");
    }

    // 3. Totales
    const tax = calculatedSubtotal * (Number(taxRate) / 100);
    const total = calculatedSubtotal + tax;
    const saleNumber = await generateSaleNumber();

    // 4. Crear venta
    const newSaleArray = await Sale.create(
      [
        {
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
        },
      ],
      session ? { session } : {}
    );

    const newSale = newSaleArray[0];

    // Confirmar transacción si estuvo activa
    if (useTransaction && session) {
      await session.commitTransaction();
    }

    logger.info(`Venta registrada exitosamente: ${saleNumber}`, {
      saleNumber,
      total,
      recipientName: finalRecipient,
      itemsCount: processedItems.length,
      userId: auth.user!.userId,
    }, "sales");

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

    // Rollback nativo de transacción
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error("Error abortando transacción:", abortErr);
      }
    } else {
      // Rollback compensatorio manual (en caso de no contar con réplica set)
      for (const mutated of mutatedProducts) {
        try {
          await Product.findByIdAndUpdate(mutated.product._id, {
            stock: mutated.prevStock,
          });
        } catch (rollbackErr) {
          console.error(`Error en rollback de stock para ${mutated.product._id}:`, rollbackErr);
        }
      }
      if (createdClientDoc) {
        try {
          await Client.findByIdAndDelete(createdClientDoc._id);
        } catch (clientErr) {
          console.error("Error eliminando cliente durante rollback:", clientErr);
        }
      }
    }

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
      { error: error.message || "Error al procesar la venta" },
      { status: 400 }
    );
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
