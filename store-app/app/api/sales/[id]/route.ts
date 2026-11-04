import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { requireAuth } from "@/lib/authMiddleware";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sales/[id] - Obtener detalle de venta por ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de venta inválido" }, { status: 400 });
    }

    await connectDB();
    const sale = await Sale.findById(id);

    if (!sale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ sale });
  } catch (error: any) {
    console.error("Error en GET /api/sales/[id]:", error);
    return NextResponse.json(
      { error: "Error al consultar la venta" },
      { status: 500 }
    );
  }
}

// PUT /api/sales/[id] - Anular venta y reponer stock
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de venta inválido" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const { action, notes } = body;

    const sale = await Sale.findById(id);
    if (!sale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    // Acción de anulación
    if (action === "anular") {
      if (sale.status === "anulada") {
        return NextResponse.json(
          { error: "Esta venta ya fue anulada previamente" },
          { status: 400 }
        );
      }

      // Reponer el stock de los productos que formaban parte de la venta
      for (const item of sale.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      sale.status = "anulada";
      if (notes) {
        sale.notes = sale.notes ? `${sale.notes} | Anulada: ${notes}` : `Anulada: ${notes}`;
      }
      await sale.save();

      return NextResponse.json({
        message: "Venta anulada y stock devuelto exitosamente al inventario",
        sale,
      });
    }

    return NextResponse.json(
      { error: "Acción no soportada. Solo se permite action='anular'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error en PUT /api/sales/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar la venta" },
      { status: 500 }
    );
  }
}
