import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  documentId: string; // Cédula, RIF, DNI o Tax ID
  name: string; // Nombre o Razón Social
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ClientSchema.index({ documentId: 1, name: "text", email: 1 });

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
