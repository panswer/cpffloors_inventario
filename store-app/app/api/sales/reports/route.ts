import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import { requireAuth } from "@/lib/authMiddleware";

// GET /api/sales/reports - Métricas y reporte de ventas con agregación en MongoDB
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status"); // completada | anulada | vacio (todas)
    const paymentMethod = searchParams.get("paymentMethod");

    // Construir filtro
    const matchQuery: Record<string, any> = {};

    if (status) {
      matchQuery.status = status;
    }

    if (paymentMethod) {
      matchQuery.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        // Si no tiene horas explicitas, incluir hasta fin de día
        if (!endDate.includes("T")) {
          end.setHours(23, 59, 59, 999);
        }
        matchQuery.createdAt.$lte = end;
      }
    }

    // 1. Métricas Generales (KPIs)
    const summaryAgg = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          completedSales: {
            $sum: { $cond: [{ $eq: ["$status", "completada"] }, 1, 0] },
          },
          cancelledSales: {
            $sum: { $cond: [{ $eq: ["$status", "anulada"] }, 1, 0] },
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$status", "completada"] }, "$total", 0] },
          },
          averageTicket: {
            $avg: { $cond: [{ $eq: ["$status", "completada"] }, "$total", null] },
          },
        },
      },
    ]);

    const summary = summaryAgg[0] || {
      totalSales: 0,
      completedSales: 0,
      cancelledSales: 0,
      totalRevenue: 0,
      averageTicket: 0,
    };

    // 2. Ventas por Método de Pago (solo completadas)
    const paymentMethodsAgg = await Sale.aggregate([
      {
        $match: {
          ...matchQuery,
          status: "completada",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$total" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // 3. Top Productos Más Vendidos (desglosando items de ventas completadas)
    const topProductsAgg = await Sale.aggregate([
      {
        $match: {
          ...matchQuery,
          status: "completada",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          sku: { $first: "$items.sku" },
          name: { $first: "$items.name" },
          unit: { $first: "$items.unit" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // 4. Listado detallado de ventas para exportación / tabla
    const sales = await Sale.find(matchQuery)
      .sort({ createdAt: -1 })
      .populate("clientId", "name documentId phone")
      .populate("userId", "name username")
      .lean();

    return NextResponse.json({
      summary: {
        totalSales: summary.totalSales,
        completedSales: summary.completedSales,
        cancelledSales: summary.cancelledSales,
        totalRevenue: Math.round((summary.totalRevenue || 0) * 100) / 100,
        averageTicket: Math.round((summary.averageTicket || 0) * 100) / 100,
      },
      byPaymentMethod: paymentMethodsAgg.map((p) => ({
        paymentMethod: p._id,
        count: p.count,
        total: Math.round(p.total * 100) / 100,
      })),
      topProducts: topProductsAgg.map((p) => ({
        productId: p._id,
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        totalQuantity: p.totalQuantity,
        totalRevenue: Math.round(p.totalRevenue * 100) / 100,
      })),
      sales,
    });
  } catch (error: any) {
    console.error("Error en GET /api/sales/reports:", error);
    return NextResponse.json(
      { error: "Error al generar el reporte de ventas" },
      { status: 500 }
    );
  }
}
