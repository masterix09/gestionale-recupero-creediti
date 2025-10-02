import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getRoleFromId } from "@/actions/getUserFromDB";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Controlla se l'utente è admin
    const userRole = await getRoleFromId(session.user.id || "");

    if (userRole?.role !== "admin") {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Ottieni tutte le notifiche non lette
    const notifications = await prisma.notification.findMany({
      where: {
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Errore nel recupero notifiche:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Controlla se l'utente è admin
    const userRole = await getRoleFromId(session.user.id || "");

    if (userRole?.role !== "admin") {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    // Marca tutte le notifiche come lette
    await prisma.notification.updateMany({
      where: {
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notifiche marcate come lette",
    });
  } catch (error) {
    console.error("Errore nell'aggiornamento notifiche:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
