import mongoose, { Schema, Document, Model } from "mongoose";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/types/product";

export interface IProduct extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: {
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
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
      default: "Contenedores",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      default: "paquete",
      trim: true,
    },
    imageUrl: {
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
    versionKey: "__v",
    optimisticConcurrency: true,
  }
);

ProductSchema.index({ sku: 1, name: "text", category: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
