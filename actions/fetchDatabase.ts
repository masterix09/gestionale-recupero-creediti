"use server";

import { auth } from "@/lib/auth";
import {
  AnagraficaPlafond,
  CCPlafond,
  LavororPlafond,
  SCPPlafond,
  TelefonoPlafond,
} from "@/lib/constants";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

const decreaseToken = async (id: string, plafond: number) => {
  // console.log(id);
  // console.log("ci son");

  const res = await prisma.user.update({
    where: {
      id,
    },
    data: {
      token: {
        decrement: plafond,
      },
    },
  });

  revalidatePath("/category/lavoro/[id]", "layout");
  // console.log(res);
};

// Funzione per ottenere i token dinamici per categoria
const getCategoryTokens = async (category: string): Promise<number> => {
  try {
    const categoryToken = await prisma.categoryToken.findUnique({
      where: {
        category: category,
      },
    });

    if (categoryToken) {
      return categoryToken.tokens;
    }

    // Fallback ai valori predefiniti se non trovati nel database
    const fallbackTokens: { [key: string]: number } = {
      anagrafica: AnagraficaPlafond,
      lavoro: LavororPlafond,
      telefono: TelefonoPlafond,
      scp: SCPPlafond,
      cc: CCPlafond,
      abicab: AnagraficaPlafond, // ABI CAB usa lo stesso valore di anagrafica
    };

    return fallbackTokens[category] || AnagraficaPlafond;
  } catch (error) {
    console.error("Errore nel recupero dei token per categoria:", error);
    // Fallback ai valori predefiniti in caso di errore
    const fallbackTokens: { [key: string]: number } = {
      anagrafica: AnagraficaPlafond,
      lavoro: LavororPlafond,
      telefono: TelefonoPlafond,
      scp: SCPPlafond,
      cc: CCPlafond,
      abicab: AnagraficaPlafond,
    };

    return fallbackTokens[category] || AnagraficaPlafond;
  }
};

export const addToken = async (data: { email: string; plafond: number }) => {
  try {
    const id = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    await prisma.user.update({
      where: {
        id: id?.id,
      },
      data: {
        token: {
          increment: data.plafond,
        },
      },
    });
    return "OK";
  } catch (error) {
    // console.log(error);
    return "NO";
  }
};

export const availableToken = async (category: string) => {
  const sessions = await auth();

  if (sessions?.user.role !== "admin") {
    const token = await prisma.user.findFirst({
      where: {
        id: sessions?.user.id ?? "",
      },
      select: {
        token: true,
        id: true,
      },
    });

    // Ottieni i token dinamici per la categoria
    const requiredTokens = await getCategoryTokens(category);

    if ((token?.token ?? 0) >= requiredTokens) {
      decreaseToken(token?.id ?? "", requiredTokens);
      return "OK";
    } else {
      return "NO";
    }

    revalidatePath(`/category/${category}/[id]`, "page");
  }
};

// Nuova funzione per controllare token e dati insieme
export const checkTokenAndData = async (category: string, id: string) => {
  const sessions = await auth();

  if (sessions?.user.role === "admin") {
    return "OK";
  }

  const token = await prisma.user.findFirst({
    where: {
      id: sessions?.user.id ?? "",
    },
    select: {
      token: true,
      id: true,
    },
  });

  // Prima controlliamo se ci sono dati
  let hasData = false;

  if (category === "anagrafica") {
    const data = await prisma.persona.findFirst({ where: { id } });
    hasData = !!data;
  } else if (category === "lavoro") {
    const data = await prisma.datore.findMany({ where: { personaID: id } });
    hasData = data.length > 0;
  } else if (category === "telefono") {
    const data = await prisma.telefono.findMany({ where: { personaID: id } });
    hasData = data.length > 0;
  } else if (category === "scp") {
    const data = await prisma.cessionePignoramento.findFirst({
      where: { personaID: id },
    });
    hasData = !!data;
  } else if (category === "cc") {
    const data = await prisma.contoCorrente.findFirst({ where: { CF: id } });
    hasData = !!data;
  } else if (category === "abicab") {
    const data = await prisma.abiCab.findMany({
      where: {
        OR: [{ personaID: id }, { datoreID: id }],
      },
    });
    hasData = data.length > 0;
  }

  // Se non ci sono dati, non decrementiamo i token
  if (!hasData) {
    return "NO_DATA";
  }

  // Se ci sono dati, controlliamo i token e decrementiamo solo se sufficienti
  // Ottieni i token dinamici per la categoria
  const requiredTokens = await getCategoryTokens(category);

  if ((token?.token ?? 0) >= requiredTokens) {
    decreaseToken(token?.id ?? "", requiredTokens);
    return "OK";
  } else {
    return "NO";
  }

  revalidatePath(`/category/${category}/[id]`, "page");
};

export const getAnagrafica = async (id: string) => {
  return await prisma.persona.findFirst({
    where: {
      id,
    },
  });
};

export const getLavoro = async (id: string) => {
  revalidatePath("/category/lavoro/[id]", "layout");
  return await prisma.datore.findMany({
    where: {
      personaID: id,
    },
  });
};

export const getSCP = async (id: string) => {
  return await prisma.cessionePignoramento.findFirst({
    where: {
      personaID: id,
    },
  });
};

export const getCC = async (id: string) => {
  return await prisma.contoCorrente.findFirst({
    where: {
      CF: id,
    },
  });
};

export const getTelefono = async (id: string) => {
  return await prisma.telefono.findMany({
    where: {
      personaID: id,
    },
  });
};

export const getABICAB = async (id: string) => {
  return await prisma.abiCab.findMany({
    where: {
      OR: [
        {
          personaID: id,
        },
        {
          datoreID: id,
        },
      ],
    },
  });
};

export const getTokenById = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      token: true,
    },
  });
};

export const getListUser = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      packageType: true,
      token: true,
    },
  });
};

export const getUserDetail = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      email: true,
      packageType: true,
      role: true,
      token: true,
      disable: true,
    },
  });
};
