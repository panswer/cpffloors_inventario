import { PRODUCT_CATEGORIES, ProductCategory } from "@/types/product";

export interface ProductItem {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku?: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit?: string;
  imageUrl?: string;
}

export interface UpdateProductInput {
  sku?: string;
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: number;
  stock?: number;
  unit?: string;
  imageUrl?: string;
  isActive?: boolean;
  __v?: number; // Versión concurrente enviada desde el front-end
}

export interface ProductFilters {
  search?: string;
  category?: string;
  isActive?: boolean | string;
}

export const productsApi = {
  // Listar productos
  async getProducts(filters?: ProductFilters): Promise<{ products: ProductItem[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.isActive !== undefined && filters?.isActive !== "") {
      params.append("isActive", String(filters.isActive));
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/products${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al listar productos");
    return data;
  },

  // Obtener producto por ID
  async getProductById(id: string): Promise<{ product: ProductItem }> {
    const res = await fetch(`/api/products/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al obtener producto");
    return data;
  },

  // Crear producto
  async createProduct(input: CreateProductInput): Promise<{ message: string; product: ProductItem }> {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al crear producto");
    return data;
  },

  // Actualizar producto
  async updateProduct(
    id: string,
    input: UpdateProductInput
  ): Promise<{ message: string; product: ProductItem }> {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al actualizar producto");
    return data;
  },

  // Dar de baja producto (Soft delete)
  async deleteProduct(id: string): Promise<{ message: string; productId: string }> {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al dar de baja el producto");
    return data;
  },
};

// Re-exportar para comodidad de imports en componentes
export { PRODUCT_CATEGORIES };
export type { ProductCategory };
