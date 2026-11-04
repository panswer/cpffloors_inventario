import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { requireAuth } from "@/lib/authMiddleware";

// GET /api/clients - Listar clientes con filtros (búsqueda, estado)
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const isActiveParam = searchParams.get("isActive");

    const filter: any = {};

    if (search) {
      filter.$or = [
        { documentId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (isActiveParam !== null && isActiveParam !== undefined && isActiveParam !== "") {
      filter.isActive = isActiveParam === "true";
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      clients,
      count: clients.length,
    });
  } catch (error: any) {
    console.error("Error en GET /api/clients:", error);
    return NextResponse.json(
      { error: "Error al listar clientes" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Crear nuevo cliente
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await req.json();
    const { documentId, name, email, phone, address, notes } = body;

    if (!documentId || !name) {
      return NextResponse.json(
        { error: "El Documento/Identificación y el Nombre son obligatorios" },
        { status: 400 }
      );
    }

    const cleanDoc = String(documentId).trim().toUpperCase();

    const existingClient = await Client.findOne({ documentId: cleanDoc });
    if (existingClient) {
      return NextResponse.json(
        { error: `Ya existe un cliente registrado con la identificación "${cleanDoc}"` },
        { status: 409 }
      );
    }

    const newClient = await Client.create({
      documentId: cleanDoc,
      name: String(name).trim(),
      email: email ? String(email).trim().toLowerCase() : "",
      phone: phone ? String(phone).trim() : "",
      address: address ? String(address).trim() : "",
      notes: notes ? String(notes).trim() : "",
      isActive: true,
    });

    return NextResponse.json(
      { message: "Cliente registrado exitosamente", client: newClient },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en POST /api/clients:", error);
    return NextResponse.json(
      { error: "Error al crear el cliente" },
      { status: 500 }
    );
  }
}
