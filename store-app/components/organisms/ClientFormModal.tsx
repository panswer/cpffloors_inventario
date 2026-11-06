"use client";

import React, { useState, useEffect } from "react";
import { FormField } from "../molecules";
import { Button } from "../atoms";
import {
  ClientItem,
  CreateClientInput,
  UpdateClientInput,
} from "@/services/clientService";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  clientToEdit?: ClientItem | null;
  isLoading?: boolean;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clientToEdit,
  isLoading = false,
}) => {
  const [documentId, setDocumentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setDocumentId(clientToEdit.documentId);
      setName(clientToEdit.name);
      setEmail(clientToEdit.email || "");
      setPhone(clientToEdit.phone || "");
      setAddress(clientToEdit.address || "");
      setNotes(clientToEdit.notes || "");
      setIsActive(clientToEdit.isActive);
    } else {
      setDocumentId("");
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setNotes("");
      setIsActive(true);
    }
    setError(null);
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!documentId.trim() || !name.trim()) {
      setError("Documento/Identificación y Nombre son obligatorios.");
      return;
    }

    const payload: CreateClientInput = {
      documentId: documentId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
    };

    try {
      if (clientToEdit) {
        await onSubmit({ ...payload, isActive } as UpdateClientInput);
      } else {
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al procesar el cliente");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {clientToEdit ? "Editar Cliente" : "Nuevo Cliente"}
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
              id="modal-documentId"
              label="Documento / RIF / Cédula"
              required
              disabled={!!clientToEdit}
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="ej. J-12345678-0"
            />

            <FormField
              id="modal-phone"
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="ej. +1 (555) 000-0000"
            />
          </div>

          <FormField
            id="modal-name"
            label="Nombre o Razón Social"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Inversiones Gastronómicas C.A."
          />

          <FormField
            id="modal-email"
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej. contacto@empresa.com"
          />

          <FormField
            id="modal-address"
            label="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ej. Av. Principal, Edificio Torre A, Piso 2"
          />

          <FormField
            id="modal-notes"
            label="Notas / Observaciones (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ej. Cliente frecuente, entregas en horario matutino"
          />

          {clientToEdit && (
            <div className="flex items-center gap-2 pt-2">
              <input
                id="modal-client-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="modal-client-active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Cliente Activo
              </label>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {clientToEdit ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
