import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Recupera i token per una categoria specifica
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { category } = params;

    const categoryToken = await prisma.categoryToken.findUnique({
      where: {
        category: category,
      },
    });

    if (!categoryToken) {
      return NextResponse.json(
        { error: "Categoria non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json(categoryToken);
  } catch (error) {
    console.error("Errore nel recupero del token per categoria:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
