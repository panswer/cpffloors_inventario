import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
}

export interface ISale extends Document {
  saleNumber: string; // ej: VNT-202611-0001
  clientId: mongoose.Types.ObjectId;
  recipientName: string; // A quién se le entrega el pedido
  deliveryAddress: string; // Dirección de entrega del pedido
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "efectivo" | "tarjeta" | "transferencia" | "credito";
  status: "completada" | "anulada";
  userId: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: "paquete",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISale>(
  {
    saleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [SaleItemSchema],
      required: true,
      validate: [(v: ISaleItem[]) => v.length > 0, "La venta debe incluir al menos un producto"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia", "credito"],
      default: "efectivo",
    },
    status: {
      type: String,
      enum: ["completada", "anulada"],
      default: "completada",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SaleSchema.index({ saleNumber: 1, recipientName: "text", createdAt: -1 });

export const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
