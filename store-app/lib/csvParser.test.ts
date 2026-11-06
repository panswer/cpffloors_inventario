import { describe, it, expect } from "vitest";
import { parseCsvContent } from "./csvParser";

describe("csvParser", () => {
  it("debe rechazar archivos vacíos o con solo encabezados sin filas", () => {
    const result = parseCsvContent("");
    expect(result.errors.length).toBeGreaterThan(0);

    const resultOnlyHeader = parseCsvContent("sku,nombre,stock\n");
    expect(resultOnlyHeader.errors.length).toBeGreaterThan(0);
  });

  it("debe exigir la columna stock o cantidad", () => {
    const csvSinStock = "sku,nombre,precio\nCON-123,Contenedor,10.5\n";
    const result = parseCsvContent(csvSinStock);
    expect(result.errors).toContain(
      "No se encontró la columna de cantidad obligatoria ('stock' o 'cantidad')."
    );
  });

  it("debe parsear correctamente filas válidas con comillas y acentos", () => {
    const csvContent =
      "SKU,Nombre,Categoría,Precio,Stock,Unidad\n" +
      'CON-001,"Contenedor Térmico 16oz",Contenedores,12.50,150,paquete\n' +
      "VAS-002,Vaso Plástico,Vasos,4.20,80,paquete\n";

    const { rows, errors } = parseCsvContent(csvContent);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(2);

    expect(rows[0].sku).toBe("CON-001");
    expect(rows[0].name).toBe("Contenedor Térmico 16oz");
    expect(rows[0].category).toBe("Contenedores");
    expect(rows[0].price).toBe(12.5);
    expect(rows[0].stock).toBe(150);
    expect(rows[0].unit).toBe("paquete");
    expect(rows[0].error).toBeUndefined();

    expect(rows[1].sku).toBe("VAS-002");
    expect(rows[1].stock).toBe(80);
  });

  it("debe marcar error en filas con stock negativo o no numérico", () => {
    const csvConError =
      "sku,nombre,stock\n" +
      "PRD-01,Producto Valido,50\n" +
      "PRD-02,Producto Invalido,-5\n" +
      "PRD-03,Producto Letras,veinte\n";

    const { rows } = parseCsvContent(csvConError);
    expect(rows).toHaveLength(3);

    expect(rows[0].error).toBeUndefined();
    expect(rows[1].error).toContain("Stock inválido");
    expect(rows[2].error).toContain("Stock inválido");
  });

  it("debe permitir productos nuevos sin SKU pero con Nombre", () => {
    const csvSinSku =
      "sku,nombre,categoria,precio,stock\n" +
      ",Servilleta Mesa Kraft,Servilletas,3.50,200\n";

    const { rows } = parseCsvContent(csvSinSku);
    expect(rows).toHaveLength(1);
    expect(rows[0].sku).toBeUndefined();
    expect(rows[0].name).toBe("Servilleta Mesa Kraft");
    expect(rows[0].action).toBe("create");
    expect(rows[0].stock).toBe(200);
  });
});
