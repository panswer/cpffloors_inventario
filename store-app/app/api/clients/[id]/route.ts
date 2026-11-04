import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { requireAuth } from "@/lib/authMiddleware";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id] - Buscar cliente por ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de cliente inválido" }, { status: 400 });
    }

    await connectDB();
    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error("Error en GET /api/clients/[id]:", error);
    return NextResponse.json(
      { error: "Error al consultar el cliente" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Actualizar cliente
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de cliente inválido" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const client = await Client.findById(id);
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Validar si el documentId cambia y verificar que no colisione con otro
    if (body.documentId && body.documentId.trim().toUpperCase() !== client.documentId) {
      const cleanDoc = body.documentId.trim().toUpperCase();
      const existingDoc = await Client.findOne({ documentId: cleanDoc, _id: { $ne: id } });
      if (existingDoc) {
        return NextResponse.json(
          { error: `La identificación "${cleanDoc}" ya pertenece a otro cliente` },
          { status: 409 }
        );
      }
      client.documentId = cleanDoc;
    }

    if (body.name !== undefined) client.name = String(body.name).trim();
    if (body.email !== undefined) client.email = String(body.email).trim().toLowerCase();
    if (body.phone !== undefined) client.phone = String(body.phone).trim();
    if (body.address !== undefined) client.address = String(body.address).trim();
    if (body.notes !== undefined) client.notes = String(body.notes).trim();
    if (body.isActive !== undefined) client.isActive = Boolean(body.isActive);

    await client.save();

    return NextResponse.json({
      message: "Cliente actualizado exitosamente",
      client,
    });
  } catch (error: any) {
    console.error("Error en PUT /api/clients/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cliente" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Dar de baja cliente (Soft delete)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de cliente inválido" }, { status: 400 });
    }

    await connectDB();
    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Soft delete: cambiar a inactivo para mantener la integridad en ventas y facturas históricas
    client.isActive = false;
    await client.save();

    return NextResponse.json({
      message: "Cliente dado de baja exitosamente",
      clientId: id,
    });
  } catch (error: any) {
    console.error("Error en DELETE /api/clients/[id]:", error);
    return NextResponse.json(
      { error: "Error al dar de baja el cliente" },
      { status: 500 }
    );
  }
}
