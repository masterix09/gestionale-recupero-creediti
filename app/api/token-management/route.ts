import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Recupera tutti i token per categoria
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const tokens = await prisma.categoryToken.findMany({
      orderBy: {
        category: "asc",
      },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Errore nel recupero dei token:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// POST - Aggiorna i token per categoria
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await request.json();
    const { anagrafica, lavoro, telefono, scp, cc, abicab } = body;

    // Validazione dei dati
    const categories = [
      { key: "anagrafica", value: anagrafica },
      { key: "lavoro", value: lavoro },
      { key: "telefono", value: telefono },
      { key: "scp", value: scp },
      { key: "cc", value: cc },
      { key: "abicab", value: abicab },
    ];

    for (const category of categories) {
      if (category.value === undefined || category.value === null) {
        return NextResponse.json(
          { error: `Valore mancante per la categoria ${category.key}` },
          { status: 400 }
        );
      }
      if (category.value < 1) {
        return NextResponse.json(
          { error: `Il valore per ${category.key} deve essere almeno 1` },
          { status: 400 }
        );
      }
    }

    // Aggiorna o crea i token per ogni categoria
    const results = [];
    for (const category of categories) {
      const result = await prisma.categoryToken.upsert({
        where: {
          category: category.key,
        },
        update: {
          tokens: category.value,
        },
        create: {
          id: `${category.key}-${Date.now()}`,
          category: category.key,
          tokens: category.value,
        },
      });
      results.push(result);
    }

    return NextResponse.json({
      message: "Token aggiornati con successo",
      tokens: results,
    });
  } catch (error) {
    console.error("Errore nell'aggiornamento dei token:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
