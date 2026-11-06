import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAuth } from "@/lib/authMiddleware";

// GET /api/products/reports - Reporte de existencias de inventario
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isActiveParam = searchParams.get("isActive");
    const stockFilter = searchParams.get("stockFilter"); // "all" | "low" | "out" | "available"

    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (isActiveParam !== null && isActiveParam !== undefined && isActiveParam !== "") {
      filter.isActive = isActiveParam === "true";
    }

    if (stockFilter === "low") {
      filter.stock = { $gt: 0, $lte: 5 };
    } else if (stockFilter === "out") {
      filter.stock = { $lte: 0 };
    } else if (stockFilter === "available") {
      filter.stock = { $gt: 0 };
    }

    // Traer productos ordenados por categoría y stock ascendente (más críticos primero)
    const products = await Product.find(filter)
      .sort({ stock: 1, name: 1 })
      .lean();

    // Métricas y resumen del inventario
    let totalStockUnits = 0;
    let totalStockValue = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    const categorySummaryMap: Record<string, { count: number; totalStock: number; totalValue: number }> = {};

    products.forEach((p) => {
      totalStockUnits += p.stock;
      totalStockValue += p.stock * p.price;

      if (p.stock <= 0) {
        outOfStockCount++;
      } else if (p.stock <= 5) {
        lowStockCount++;
      }

      if (!categorySummaryMap[p.category]) {
        categorySummaryMap[p.category] = { count: 0, totalStock: 0, totalValue: 0 };
      }
      categorySummaryMap[p.category].count++;
      categorySummaryMap[p.category].totalStock += p.stock;
      categorySummaryMap[p.category].totalValue += p.stock * p.price;
    });

    const categorySummary = Object.entries(categorySummaryMap).map(([category, stats]) => ({
      category,
      productCount: stats.count,
      totalStock: stats.totalStock,
      totalValue: Number(stats.totalValue.toFixed(2)),
    }));

    return NextResponse.json({
      products,
      summary: {
        totalProducts: products.length,
        totalStockUnits,
        totalStockValue: Number(totalStockValue.toFixed(2)),
        outOfStockCount,
        lowStockCount,
        categorySummary,
      },
    });
  } catch (error: any) {
    console.error("Error en GET /api/products/reports:", error);
    return NextResponse.json(
      { error: "Error al generar el reporte de existencias de productos" },
      { status: 500 }
    );
  }
}
