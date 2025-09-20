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

    if (category === "anagrafica") {
      if ((token?.token ?? 0) > AnagraficaPlafond) {
        decreaseToken(token?.id ?? "", AnagraficaPlafond);
        return "OK";
      } else return "NO";
    }

    if (category === "lavoro") {
      if ((token?.token ?? 0) > LavororPlafond) {
        decreaseToken(token?.id ?? "", LavororPlafond);
        return "OK";
      } else return "NO";
    }

    if (category === "telefono") {
      if ((token?.token ?? 0) > TelefonoPlafond) {
        decreaseToken(token?.id ?? "", TelefonoPlafond);
        return "OK";
      } else return "NO";
    }

    if (category === "scp") {
      if ((token?.token ?? 0) > SCPPlafond) {
        decreaseToken(token?.id ?? "", SCPPlafond);
        return "OK";
      } else return "NO";
    }
    if (category === "cc") {
      if ((token?.token ?? 0) > CCPlafond) {
        decreaseToken(token?.id ?? "", CCPlafond);
        return "OK";
      } else return "NO";
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
  if (category === "anagrafica") {
    if ((token?.token ?? 0) > AnagraficaPlafond) {
      decreaseToken(token?.id ?? "", AnagraficaPlafond);
      return "OK";
    } else return "NO";
  }

  if (category === "lavoro") {
    if ((token?.token ?? 0) > LavororPlafond) {
      decreaseToken(token?.id ?? "", LavororPlafond);
      return "OK";
    } else return "NO";
  }

  if (category === "telefono") {
    if ((token?.token ?? 0) > TelefonoPlafond) {
      decreaseToken(token?.id ?? "", TelefonoPlafond);
      return "OK";
    } else return "NO";
  }

  if (category === "scp") {
    if ((token?.token ?? 0) > SCPPlafond) {
      decreaseToken(token?.id ?? "", SCPPlafond);
      return "OK";
    } else return "NO";
  }

  if (category === "cc") {
    if ((token?.token ?? 0) > CCPlafond) {
      decreaseToken(token?.id ?? "", CCPlafond);
      return "OK";
    } else return "NO";
  }

  if (category === "abicab") {
    if ((token?.token ?? 0) > AnagraficaPlafond) {
      // ABI CAB usa lo stesso plafond di anagrafica
      decreaseToken(token?.id ?? "", AnagraficaPlafond);
      return "OK";
    } else return "NO";
  }

  revalidatePath(`/category/${category}/[id]`, "page");
  return "NO";
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
