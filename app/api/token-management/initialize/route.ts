import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// Valori predefiniti per l'inizializzazione
const DEFAULT_TOKENS = {
  anagrafica: 10,
  lavoro: 15,
  telefono: 20,
  scp: 30,
  cc: 30,
  abicab: 10, // ABI CAB usa lo stesso valore di anagrafica
};

// POST - Inizializza i token con valori predefiniti
export async function POST() {
  try {
    const session = await auth();

    console.log("session =>", session);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Controlla se esistono già dei token
    const existingTokens = await prisma.categoryToken.findMany();
    if (existingTokens.length > 0) {
      return NextResponse.json(
        { error: "I token sono già stati inizializzati" },
        { status: 400 }
      );
    }

    // Crea i token con valori predefiniti
    const results = [];
    for (const [category, tokens] of Object.entries(DEFAULT_TOKENS)) {
      const result = await prisma.categoryToken.create({
        data: {
          id: `${category}-${Date.now()}`,
          category,
          tokens,
        },
      });
      results.push(result);
    }

    return NextResponse.json({
      message: "Token inizializzati con successo",
      tokens: results,
    });
  } catch (error) {
    console.error("Errore nell'inizializzazione dei token:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
