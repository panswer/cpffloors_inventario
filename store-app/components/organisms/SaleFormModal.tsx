"use client";

import React, { useState } from "react";
import { FormField, SelectField } from "../molecules";
import { Button } from "../atoms";
import { ClientItem } from "@/services/clientService";
import { ProductItem } from "@/services/productService";
import { CreateSaleInput, MinimalClientInput } from "@/services/saleService";

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSaleInput) => Promise<void>;
  clients: ClientItem[];
  products: ProductItem[];
  isLoading?: boolean;
}

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  unit: string;
  quantity: number;
}

export const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clients,
  products,
  isLoading = false,
}) => {
  // Modo de cliente: "select" (existente) o "create" (nuevo al vuelo)
  const [clientMode, setClientMode] = useState<"select" | "create">("select");

  // Cliente existente
  const [selectedClientId, setSelectedClientId] = useState("");

  // Cliente nuevo (datos mínimos en borrador)
  const [newClientDoc, setNewClientDoc] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");

  // Datos de entrega
  const [recipientName, setRecipientName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "efectivo" | "tarjeta" | "transferencia" | "credito"
  >("efectivo");
  const [notes, setNotes] = useState("");

  // Carrito de compras
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Al seleccionar cliente existente
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c._id === clientId);
    if (client) {
      setRecipientName(client.name);
      setDeliveryAddress(client.address || "");
    }
  };

  // Al escribir en cliente nuevo, sincronizar destinatario y dirección por comodidad
  const handleNewClientNameChange = (val: string) => {
    setNewClientName(val);
    setRecipientName(val);
  };

  const handleNewClientAddressChange = (val: string) => {
    setNewClientAddress(val);
    setDeliveryAddress(val);
  };

  // Agregar ítem al carrito
  const handleAddItem = () => {
    setError(null);
    if (!selectedProductId) {
      setError("Selecciona un producto para añadir.");
      return;
    }
    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }

    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    if (qty > product.stock) {
      setError(`Stock insuficiente. Disponible: ${product.stock} ${product.unit}`);
      return;
    }

    const existingIndex = cart.findIndex((i) => i.productId === product._id);
    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + qty;
      if (newQty > product.stock) {
        setError(`Supera el stock disponible (${product.stock} ${product.unit})`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          unit: product.unit,
          quantity: qty,
        },
      ]);
    }

    setSelectedProductId("");
    setItemQuantity("1");
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError("Agrega al menos un producto a la venta.");
      return;
    }

    const payload: CreateSaleInput = {
      recipientName: recipientName.trim(),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      notes: notes.trim(),
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    if (clientMode === "create") {
      if (!newClientDoc.trim() || !newClientName.trim()) {
        setError("El documento/RIF y nombre del cliente son obligatorios para crearlo.");
        return;
      }
      const clientData: MinimalClientInput = {
        documentId: newClientDoc.trim().toUpperCase(),
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
        address: newClientAddress.trim(),
      };
      payload.newClient = clientData;
    } else {
      if (!selectedClientId) {
        setError("Por favor selecciona un cliente de la lista.");
        return;
      }
      payload.clientId = selectedClientId;
    }

    if (!recipientName.trim() || !deliveryAddress.trim()) {
      setError("El nombre de quien recibe y la dirección de entrega son obligatorios.");
      return;
    }

    try {
      await onSubmit(payload);
      // Limpiar y cerrar
      setCart([]);
      setSelectedClientId("");
      setNewClientDoc("");
      setNewClientName("");
      setNewClientPhone("");
      setNewClientAddress("");
      setRecipientName("");
      setDeliveryAddress("");
      setNotes("");
      setClientMode("select");
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al procesar la venta");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Cabecera Fija */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Nueva Venta / Pedido
            </h2>
            <p className="text-xs text-zinc-500">
              Registra los productos, cliente y dirección de entrega
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo con Scroll Interno Seguro */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <form id="sale-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Sección 1: Cliente y Entrega */}
            <div className="space-y-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 sm:p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  1. Cliente y Despacho
                </h3>
                <button
                  type="button"
                  onClick={() => setClientMode(clientMode === "select" ? "create" : "select")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 underline text-left sm:text-right"
                >
                  {clientMode === "select"
                    ? "+ Registrar Cliente Nuevo"
                    : "← Seleccionar Cliente Existente"}
                </button>
              </div>

              {/* Formulario Cliente Existente */}
              {clientMode === "select" ? (
                <SelectField
                  id="sale-client"
                  label="Cliente Registrado"
                  required
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  options={[
                    { label: "Selecciona un cliente...", value: "" },
                    ...clients
                      .filter((c) => c.isActive)
                      .map((c) => ({
                        label: `${c.name} (${c.documentId})`,
                        value: c._id,
                      })),
                  ]}
                />
              ) : (
                /* Formulario Cliente Nuevo */
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    ⚡ Datos Mínimos del Nuevo Cliente (Se guardará al registrar la venta)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      id="new-client-doc"
                      label="Documento / Cédula / RIF"
                      required
                      value={newClientDoc}
                      onChange={(e) => setNewClientDoc(e.target.value)}
                      placeholder="ej. J-12345678"
                    />
                    <FormField
                      id="new-client-phone"
                      label="Teléfono (opcional)"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="ej. +1 (555) 000-0000"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      id="new-client-name"
                      label="Nombre / Razón Social"
                      required
                      value={newClientName}
                      onChange={(e) => handleNewClientNameChange(e.target.value)}
                      placeholder="ej. Restaurante El Gourmet C.A."
                    />
                    <FormField
                      id="new-client-address"
                      label="Dirección Principal (opcional)"
                      value={newClientAddress}
                      onChange={(e) => handleNewClientAddressChange(e.target.value)}
                      placeholder="ej. Calle 10 con Av. 4"
                    />
                  </div>
                </div>
              )}

              {/* Datos de Entrega */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <FormField
                  id="sale-recipient"
                  label="A quién se le entrega el pedido"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Persona o encargado de recibir"
                />

                <FormField
                  id="sale-address"
                  label="Dirección de Entrega"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Lugar exacto de despacho"
                />
              </div>
            </div>

            {/* Sección 2: Productos y Carrito */}
            <div className="space-y-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 sm:p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                2. Productos de la Venta
              </h3>

              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-end">
                <div className="flex-1 min-w-0">
                  <SelectField
                    id="sale-product-select"
                    label="Producto"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    options={[
                      { label: "Selecciona un producto...", value: "" },
                      ...products
                        .filter((p) => p.isActive && p.stock > 0)
                        .map((p) => ({
                          label: `${p.name} - $${p.price} (Stock: ${p.stock} ${p.unit})`,
                          value: p._id,
                        })),
                    ]}
                  />
                </div>

                <div className="w-full sm:w-28">
                  <FormField
                    id="sale-qty"
                    label="Cantidad"
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddItem}
                  className="w-full sm:w-auto h-[42px]"
                >
                  + Añadir
                </Button>
              </div>

              {/* Tabla Carrito */}
              {cart.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                  <table className="min-w-full divide-y divide-zinc-200 text-left text-xs dark:divide-zinc-700">
                    <thead className="bg-zinc-50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400">
                      <tr>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2">Precio</th>
                        <th className="px-3 py-2">Cant.</th>
                        <th className="px-3 py-2">Subtotal</th>
                        <th className="px-3 py-2 text-right">Quitar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                      {cart.map((item, idx) => (
                        <tr key={item.productId}>
                          <td className="px-3 py-2 font-medium max-w-[150px] truncate">
                            {item.name}
                          </td>
                          <td className="px-3 py-2">${item.price.toFixed(2)}</td>
                          <td className="px-3 py-2">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-3 py-2 font-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700 font-bold p-1"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic text-center py-2">
                  No hay productos añadidos al pedido todavía.
                </p>
              )}
            </div>

            {/* Sección 3: Pago y Notas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <SelectField
                id="sale-payment-method"
                label="Método de Pago"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                options={[
                  { label: "Efectivo", value: "efectivo" },
                  { label: "Tarjeta de Débito/Crédito", value: "tarjeta" },
                  { label: "Transferencia Bancaria", value: "transferencia" },
                  { label: "Crédito Comercial", value: "credito" },
                ]}
              />

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4 text-right dark:border-zinc-800 dark:bg-zinc-800/40">
                <span className="text-xs text-zinc-500 block">Total a Pagar</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <FormField
              id="sale-notes"
              label="Notas / Instrucciones de Entrega (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ej. Dejar en recepción, horario de 9am a 1pm"
            />
          </form>
        </div>

        {/* Pie de Página Fijo con Acciones */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="sale-form"
            isLoading={isLoading}
            disabled={cart.length === 0}
          >
            Registrar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
};
