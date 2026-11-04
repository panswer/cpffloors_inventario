"use client";

import React, { useState, useEffect } from "react";
import { FormField, SelectField } from "../molecules";
import { Button } from "../atoms";
import {
  ProductItem,
  CreateProductInput,
  UpdateProductInput,
  PRODUCT_CATEGORIES,
  ProductCategory,
} from "@/services/productService";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  productToEdit?: ProductItem | null;
  isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  isLoading = false,
}) => {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Contenedores");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("paquete");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setDescription(productToEdit.description || "");
      setCategory(productToEdit.category || "Contenedores");
      setPrice(String(productToEdit.price));
      setStock(String(productToEdit.stock));
      setUnit(productToEdit.unit || "paquete");
      setImageUrl(productToEdit.imageUrl || "");
      setIsActive(productToEdit.isActive);
    } else {
      setSku("");
      setName("");
      setDescription("");
      setCategory("Contenedores");
      setPrice("");
      setStock("");
      setUnit("paquete");
      setImageUrl("");
      setIsActive(true);
    }
    setError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !price || stock === "") {
      setError("Nombre, precio y stock son campos requeridos.");
      return;
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      setError("El precio y stock no pueden ser negativos.");
      return;
    }

    const payload: CreateProductInput = {
      name: name.trim(),
      description: description.trim(),
      category: category,
      price: Number(price),
      stock: Number(stock),
      unit: unit.trim(),
      imageUrl: imageUrl.trim(),
    };

    if (sku.trim()) {
      payload.sku = sku.trim().toUpperCase();
    }

    try {
      if (productToEdit) {
        await onSubmit({
          ...payload,
          isActive,
          __v: productToEdit.__v, // Enviar la versión que el usuario cargó
        } as UpdateProductInput);
      } else {
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al procesar el producto");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {productToEdit ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="modal-sku"
              label="SKU / Código (opcional)"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="ej. CON-XXXXXX"
            />

            <SelectField
              id="modal-category"
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              options={PRODUCT_CATEGORIES.map((cat) => ({
                label: cat,
                value: cat,
              }))}
            />
          </div>

          <FormField
            id="modal-name"
            label="Nombre del Producto"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Contenedor Térmico 8oz"
          />

          <FormField
            id="modal-description"
            label="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ej. Material biodegradable, apto para alimentos calientes"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              id="modal-price"
              label="Precio ($)"
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />

            <FormField
              id="modal-stock"
              label="Stock"
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
            />

            <SelectField
              id="modal-unit"
              label="Unidad"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={[
                { label: "Paquete", value: "paquete" },
                { label: "Caja", value: "caja" },
                { label: "Pieza / Unidad", value: "pieza" },
                { label: "Millar", value: "millar" },
                { label: "Bolsa", value: "bolsa" },
              ]}
            />
          </div>

          {productToEdit && (
            <div className="flex items-center gap-2 pt-2">
              <input
                id="modal-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="modal-active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Producto Activo en Catálogo
              </label>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {productToEdit ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
