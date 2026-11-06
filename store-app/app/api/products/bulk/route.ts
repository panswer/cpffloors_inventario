import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/types/product";
import { requireAuth } from "@/lib/authMiddleware";
import { logger } from "@/lib/logger";
import crypto from "crypto";

const CATEGORY_PREFIXES: Record<string, string> = {
  Contenedores: "CON",
  Vasos: "VAS",
  Cubiertos: "CUB",
  Servilletas: "SER",
  Empaques: "EMP",
};

async function generateUniqueSku(category: string): Promise<string> {
  const prefix = CATEGORY_PREFIXES[category] || "PRD";
  let unique = false;
  let sku = "";

  while (!unique) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    sku = `${prefix}-${randomHex}`;
    const exists = await Product.findOne({ sku });
    if (!exists) unique = true;
  }

  return sku;
}

export interface BulkItemInput {
  sku?: string;
  name: string;
  category?: string;
  price?: number;
  stock: number;
  unit?: string;
  description?: string;
  mode?: "add" | "set"; // 'add' incrementa la cantidad existente; 'set' establece el stock exacto
}

// POST /api/products/bulk - Carga masiva e importación por hoja de cálculo
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await req.json();
    const items: BulkItemInput[] = body.items || [];
    const defaultMode: "add" | "set" = body.mode === "set" ? "set" : "add";

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron productos para procesar." },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: Array<{ row: number; item: string; error: string }> = [];
    const details: Array<{ action: "created" | "updated"; sku: string; name: string; quantity: number; currentStock: number }> = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;

      try {
        const itemMode = item.mode || defaultMode;
        const cleanSku = item.sku ? item.sku.trim().toUpperCase() : "";
        const cleanName = item.name ? item.name.trim() : "";
        const stockQty = Number(item.stock);

        if (isNaN(stockQty) || stockQty < 0) {
          errors.push({ row: rowNum, item: cleanSku || cleanName || "Fila", error: "Cantidad de stock inválida" });
          continue;
        }

        // Buscar producto existente por SKU o Nombre exacto (case-insensitive)
        let existingProduct = null;
        if (cleanSku) {
          existingProduct = await Product.findOne({ sku: cleanSku });
        }
        if (!existingProduct && cleanName) {
          existingProduct = await Product.findOne({ name: { $regex: `^${cleanName}$`, $options: "i" } });
        }

        if (existingProduct) {
          // ACTUALIZAR PRODUCTO EXISTENTE / AUMENTAR STOCK
          const prevStock = existingProduct.stock;
          let newStock = prevStock;
          let diff = 0;

          if (itemMode === "add") {
            newStock = prevStock + stockQty;
            diff = stockQty;
          } else {
            // 'set'
            newStock = stockQty;
            diff = newStock - prevStock;
          }

          existingProduct.stock = newStock;
          if (item.price !== undefined && !isNaN(Number(item.price)) && Number(item.price) >= 0) {
            existingProduct.price = Number(item.price);
          }
          if (item.unit) {
            existingProduct.unit = item.unit.trim();
          }
          if (item.description) {
            existingProduct.description = item.description.trim();
          }

          existingProduct.increment();
          await existingProduct.save();
          updatedCount++;

          details.push({
            action: "updated",
            sku: existingProduct.sku,
            name: existingProduct.name,
            quantity: diff,
            currentStock: newStock,
          });

          // Log de inventario para Grafana/Filebeat
          if (diff !== 0) {
            logger.info(
              `Carga masiva: actualización de stock en "${existingProduct.name}" (${diff > 0 ? "+" : ""}${diff} ${existingProduct.unit})`,
              {
                eventType: "inventory_movement",
                movementType: diff > 0 ? "in" : "out",
                reason: "bulk_spreadsheet_import",
                productId: existingProduct._id.toString(),
                sku: existingProduct.sku,
                productName: existingProduct.name,
                category: existingProduct.category,
                quantity: Math.abs(diff),
                unit: existingProduct.unit,
                previousStock: prevStock,
                currentStock: newStock,
                userId: auth.user!.userId,
                username: auth.user!.username,
              },
              "inventory"
            );
          }
        } else {
          // CREAR NUEVO PRODUCTO
          if (!cleanName) {
            errors.push({ row: rowNum, item: cleanSku || "Fila", error: "El nombre es obligatorio para productos nuevos" });
            continue;
          }

          const validCategory = PRODUCT_CATEGORIES.includes(item.category as any)
            ? (item.category as ProductCategory)
            : "Contenedores";

          const finalSku = cleanSku || (await generateUniqueSku(validCategory));
          const finalPrice = item.price !== undefined && !isNaN(Number(item.price)) ? Number(item.price) : 0;
          const finalUnit = item.unit ? item.unit.trim() : "paquete";

          const newProd = await Product.create({
            sku: finalSku,
            name: cleanName,
            description: item.description ? item.description.trim() : "",
            category: validCategory,
            price: finalPrice,
            stock: stockQty,
            unit: finalUnit,
            isActive: true,
          });

          createdCount++;
          details.push({
            action: "created",
            sku: newProd.sku,
            name: newProd.name,
            quantity: stockQty,
            currentStock: stockQty,
          });

          // Log de inventario para Grafana/Filebeat
          logger.info(`Carga masiva: nuevo producto creado "${newProd.name}" con ${stockQty} ${newProd.unit}`, {
            eventType: "inventory_movement",
            movementType: "in",
            reason: "bulk_spreadsheet_import",
            productId: newProd._id.toString(),
            sku: newProd.sku,
            productName: newProd.name,
            category: newProd.category,
            quantity: stockQty,
            unit: newProd.unit,
            previousStock: 0,
            currentStock: stockQty,
            userId: auth.user!.userId,
            username: auth.user!.username,
          }, "inventory");
        }
      } catch (rowErr: any) {
        errors.push({
          row: rowNum,
          item: items[i].sku || items[i].name || `Fila ${rowNum}`,
          error: rowErr.message || "Error procesando fila",
        });
      }
    }

    return NextResponse.json({
      message: `Procesamiento completado: ${createdCount} productos creados, ${updatedCount} actualizados.`,
      summary: {
        total: items.length,
        created: createdCount,
        updated: updatedCount,
        failed: errors.length,
      },
      errors,
      details,
    });
  } catch (error: any) {
    console.error("Error en POST /api/products/bulk:", error);
    return NextResponse.json(
      { error: "Error al procesar la carga masiva de productos" },
      { status: 500 }
    );
  }
}
