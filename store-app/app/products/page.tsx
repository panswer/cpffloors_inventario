"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardTemplate } from "@/components/templates";
import { ProductsTable, ProductFormModal, ProductBulkUploadModal } from "@/components/organisms";
import { Button, Input } from "@/components/atoms";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { ProductItem, PRODUCT_CATEGORIES } from "@/services/productService";

export default function ProductsPage() {
  const { user: currentUser, logout, isLoggingOut } = useAuth();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Hook conectado a API con React Query
  const {
    products,
    count,
    isLoading,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
    importBulk,
    isImporting,
  } = useProducts({
    search: searchTerm,
    category: categoryFilter,
    isActive: activeFilter,
  });

  const canManage = currentUser?.role === "admin" || currentUser?.role === "manager";

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (product: ProductItem) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas dar de baja el producto "${product.name}" (${product.sku})?`
    );
    if (confirmed) {
      try {
        await deleteProduct(product._id);
      } catch (err: any) {
        alert(err.message || "Error al dar de baja el producto");
      }
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (selectedProduct) {
      await updateProduct({ id: selectedProduct._id, data: formData });
    } else {
      await createProduct(formData);
    }
  };

  return (
    <DashboardTemplate user={currentUser} onLogout={logout} isLoggingOut={isLoggingOut}>
      {/* Navegación superior y Título */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-blue-600 transition">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">Productos</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Inventario de Productos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Contenedores, vasos, cubiertos, servilletas y empaques ({count} total)
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" onClick={() => setIsBulkModalOpen(true)}>
              📄 Carga Masiva (CSV)
            </Button>
            <Button variant="primary" onClick={handleOpenCreate}>
              + Nuevo Producto
            </Button>
          </div>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-3">
        <div>
          <Input
            placeholder="Buscar por SKU, nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Dados de Baja</option>
          </select>
        </div>
      </div>

      {/* Tabla de Productos */}
      <ProductsTable
        products={products}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        canManage={canManage}
      />

      {/* Modal de Creación / Edición */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        productToEdit={selectedProduct}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal de Carga Masiva (Hoja de cálculo CSV) */}
      <ProductBulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImport={(items, mode) => importBulk({ items, mode })}
        isLoading={isImporting}
      />
    </DashboardTemplate>
  );
}
