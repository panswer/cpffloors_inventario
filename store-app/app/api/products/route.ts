import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/types/product";
import { requireAuth } from "@/lib/authMiddleware";
import { logger } from "@/lib/logger";
import crypto from "crypto";

// Mapa de prefijos SKU según la categoría
const CATEGORY_PREFIXES: Record<string, string> = {
  Contenedores: "CON",
  Vasos: "VAS",
  Cubiertos: "CUB",
  Servilletas: "SER",
  Empaques: "EMP",
};

// Generar SKU único aleatorio
async function generateUniqueSku(category: string): Promise<string> {
  const prefix = CATEGORY_PREFIXES[category] || "PRD";
  let unique = false;
  let sku = "";

  while (!unique) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    sku = `${prefix}-${randomHex}`;
    const exists = await Product.findOne({ sku });
    if (!exists) {
      unique = true;
    }
  }

  return sku;
}

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const isActiveParam = searchParams.get("isActive");

    const filter: any = {};

    if (search) {
      filter.$or = [
        { sku: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (isActiveParam !== null && isActiveParam !== undefined && isActiveParam !== "") {
      filter.isActive = isActiveParam === "true";
    }

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 50) : 50;

    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).limit(limit),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      count: totalCount,
      limit,
    });
  } catch (error: any) {
    console.error("Error en GET /api/products:", error);
    return NextResponse.json(
      { error: "Error al listar productos" },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await req.json();
    const { sku, name, description, category, price, stock, unit, imageUrl } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Nombre, precio y stock son campos requeridos" },
        { status: 400 }
      );
    }

    // Validar categoría dentro del conjunto permitido
    const validCategory = PRODUCT_CATEGORIES.includes(category)
      ? (category as ProductCategory)
      : "Contenedores";

    // Si no recibe SKU o viene vacío, generar uno aleatorio único con prefijo de la categoría
    let finalSku: string;
    if (sku && String(sku).trim()) {
      finalSku = String(sku).trim().toUpperCase();
      const existingProduct = await Product.findOne({ sku: finalSku });
      if (existingProduct) {
        return NextResponse.json(
          { error: `El producto con SKU "${finalSku}" ya existe` },
          { status: 409 }
        );
      }
    } else {
      finalSku = await generateUniqueSku(validCategory);
    }

    const newProduct = await Product.create({
      sku: finalSku,
      name: String(name).trim(),
      description: description ? String(description).trim() : "",
      category: validCategory,
      price: Number(price),
      stock: Number(stock),
      unit: unit ? String(unit).trim() : "paquete",
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
      isActive: true,
    });

    // Registrar log de evento de inventario (Entrada inicial de producto)
    logger.info(`Entrada de inventario por nuevo producto: ${newProduct.name}`, {
      eventType: "inventory_movement",
      movementType: "in",
      reason: "product_created",
      productId: newProduct._id.toString(),
      sku: newProduct.sku,
      productName: newProduct.name,
      category: newProduct.category,
      quantity: newProduct.stock,
      unit: newProduct.unit,
      currentStock: newProduct.stock,
      userId: auth.user!.userId,
      username: auth.user!.username,
    }, "inventory");

    return NextResponse.json(
      { message: "Producto registrado exitosamente", product: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en POST /api/products:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
