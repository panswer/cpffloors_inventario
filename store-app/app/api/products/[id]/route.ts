import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAuth } from "@/lib/authMiddleware";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id] - Buscar producto por ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Error en GET /api/products/[id]:", error);
    return NextResponse.json(
      { error: "Error al consultar producto" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Actualizar producto con control de versiones concurrente (__v)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Validación de versión optimista si el cliente envía __v
    if (body.__v !== undefined && body.__v !== null) {
      const clientVersion = Number(body.__v);
      if (product.__v !== clientVersion) {
        return NextResponse.json(
          {
            error:
              "Conflicto de concurrencia: el producto fue modificado previamente por otro usuario o proceso. Recarga los datos antes de volver a guardar.",
            code: "VERSION_CONFLICT",
            currentVersion: product.__v,
          },
          { status: 409 }
        );
      }
    }

    // Si intenta cambiar el SKU, validar que no esté en uso por otro producto
    if (body.sku && body.sku.trim().toUpperCase() !== product.sku) {
      const cleanSku = body.sku.trim().toUpperCase();
      const existingSku = await Product.findOne({ sku: cleanSku, _id: { $ne: id } });
      if (existingSku) {
        return NextResponse.json(
          { error: `El SKU "${cleanSku}" ya está asignado a otro producto` },
          { status: 409 }
        );
      }
      product.sku = cleanSku;
    }

    if (body.name !== undefined) product.name = String(body.name).trim();
    if (body.description !== undefined) product.description = String(body.description).trim();
    if (body.category !== undefined) product.category = String(body.category).trim() as any;
    if (body.price !== undefined) product.price = Number(body.price);
    if (body.stock !== undefined) product.stock = Number(body.stock);
    if (body.unit !== undefined) product.unit = String(body.unit).trim();
    if (body.imageUrl !== undefined) product.imageUrl = String(body.imageUrl).trim();
    if (body.isActive !== undefined) product.isActive = Boolean(body.isActive);

    // Si el cliente especificó la versión, sincronizarla con el documento para que Mongoose verifique en save()
    if (body.__v !== undefined && body.__v !== null) {
      product.__v = Number(body.__v);
    }

    await product.save();

    return NextResponse.json({
      message: "Producto actualizado correctamente",
      product,
    });
  } catch (error: any) {
    console.error("Error en PUT /api/products/[id]:", error);

    // Mongoose VersionError captura colisiones durante save()
    if (error.name === "VersionError") {
      return NextResponse.json(
        {
          error:
            "Conflicto de versiones: el producto ya ha sido actualizado previamente. Por favor actualiza la vista para ver los cambios recientes.",
          code: "VERSION_CONFLICT",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Dar de baja producto (Soft delete)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    return NextResponse.json({
      message: "Producto dado de baja exitosamente",
      productId: id,
    });
  } catch (error: any) {
    console.error("Error en DELETE /api/products/[id]:", error);
    if (error.name === "VersionError") {
      return NextResponse.json(
        {
          error:
            "El producto fue actualizado recientemente. Actualiza la lista e intenta de nuevo.",
          code: "VERSION_CONFLICT",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Error al dar de baja el producto" },
      { status: 500 }
    );
  }
}
