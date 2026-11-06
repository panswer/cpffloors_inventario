// Utilidad ligera para parsear archivos CSV en el navegador sin dependencias externas
export interface CsvParsedRow {
  sku?: string;
  name: string;
  category: string;
  price?: number;
  stock: number;
  unit?: string;
  description?: string;
  action: "create" | "update_stock";
  rowNumber: number;
  raw: Record<string, string>;
  error?: string;
}

export function parseCsvContent(text: string): { rows: CsvParsedRow[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { rows: [], errors: ["El archivo CSV debe tener una fila de encabezados y al menos una fila de datos."] };
  }

  // Parsear línea respetando comillas
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const rawHeaders = parseLine(lines[0]).map((h) =>
    h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")
  );

  // Mapear columnas requeridas
  // sku, nombre/name, categoria/category, precio/price, stock/cantidad/quantity, unidad/unit, descripcion/description
  const colIndex = {
    sku: rawHeaders.findIndex((h) => h === "sku" || h === "codigo"),
    name: rawHeaders.findIndex((h) => h === "nombre" || h === "name" || h === "producto"),
    category: rawHeaders.findIndex((h) => h === "categoria" || h === "category"),
    price: rawHeaders.findIndex((h) => h === "precio" || h === "price"),
    stock: rawHeaders.findIndex((h) => h === "stock" || h === "cantidad" || h === "cant" || h === "quantity"),
    unit: rawHeaders.findIndex((h) => h === "unidad" || h === "unit"),
    description: rawHeaders.findIndex((h) => h === "descripcion" || h === "description"),
  };

  if (colIndex.stock === -1) {
    errors.push("No se encontró la columna de cantidad obligatoria ('stock' o 'cantidad').");
  }
  if (colIndex.sku === -1 && colIndex.name === -1) {
    errors.push("El archivo debe contener al menos la columna 'sku' o la columna 'nombre' para identificar los productos.");
  }

  if (errors.length > 0) {
    return { rows: [], errors };
  }

  const rows: CsvParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.every((v) => v === "")) continue; // Saltar filas vacías

    const sku = colIndex.sku !== -1 ? values[colIndex.sku] || "" : "";
    const name = colIndex.name !== -1 ? values[colIndex.name] || "" : "";
    const category = colIndex.category !== -1 ? values[colIndex.category] || "Contenedores" : "Contenedores";
    const priceRaw = colIndex.price !== -1 ? values[colIndex.price] : "";
    const stockRaw = colIndex.stock !== -1 ? values[colIndex.stock] : "";
    const unit = colIndex.unit !== -1 ? values[colIndex.unit] || "paquete" : "paquete";
    const description = colIndex.description !== -1 ? values[colIndex.description] || "" : "";

    const raw: Record<string, string> = {};
    rawHeaders.forEach((h, idx) => {
      raw[h] = values[idx] || "";
    });

    const parsedStock = parseFloat(stockRaw.replace(",", "."));
    const parsedPrice = priceRaw ? parseFloat(priceRaw.replace(",", ".")) : undefined;

    let rowError: string | undefined = undefined;

    if (isNaN(parsedStock) || parsedStock < 0) {
      rowError = `Stock inválido: "${stockRaw}"`;
    } else if (!sku && !name) {
      rowError = "Fila sin SKU ni Nombre para identificar el producto.";
    }

    // Si tiene SKU o nombre
    const action: "create" | "update_stock" = sku ? "update_stock" : "create";

    rows.push({
      sku: sku.toUpperCase() || undefined,
      name,
      category,
      price: parsedPrice,
      stock: isNaN(parsedStock) ? 0 : parsedStock,
      unit,
      description,
      action,
      rowNumber: i + 1,
      raw,
      error: rowError,
    });
  }

  return { rows, errors };
}
