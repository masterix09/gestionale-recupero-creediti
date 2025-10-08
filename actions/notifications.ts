"use server";

import prisma from "@/lib/db";
import { getRoleFromId } from "./getUserFromDB";

export async function getNotifications(userId: string) {
  try {
    // Controlla se l'utente è admin
    const userRole = await getRoleFromId(userId);

    if (userRole?.role !== "admin") {
      return { notifications: [], count: 0 };
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

    return {
      notifications,
      count: notifications.length,
    };
  } catch (error) {
    console.error("Errore nel recupero notifiche:", error);
    return { notifications: [], count: 0 };
  }
}

export async function markNotificationsAsRead(userId: string) {
  try {
    // Controlla se l'utente è admin
    const userRole = await getRoleFromId(userId);

    if (userRole?.role !== "admin") {
      return { success: false, message: "Accesso negato" };
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

    return {
      success: true,
      message: "Notifiche marcate come lette",
    };
  } catch (error) {
    console.error("Errore nell'aggiornamento notifiche:", error);
    return { success: false, message: "Errore interno del server" };
  }
}
