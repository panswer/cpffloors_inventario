export const PRODUCT_CATEGORIES = [
  "Contenedores",
  "Vasos",
  "Cubiertos",
  "Servilletas",
  "Empaques",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
