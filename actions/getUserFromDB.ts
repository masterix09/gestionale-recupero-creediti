"use server";

import { signIn } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function checkUser(email: string, password: string) {
  return await prisma.user.findFirst({
    where: {
      email,
      password,
    },
    select: {
      id: true,
      email: true,
      packageType: false,
      password: false,
      role: true,
      disable: true,
    },
  });
}

export async function checkUserPackage(email: string) {
  return await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      packageType: true,
      password: false,
      role: true,
    },
  });
}

export const getRoleFromId = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      role: true,
    },
  });
};

export async function login(formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error: any) {
    console.error("Errore durante il login");
    throw error; // Rilancia l'errore per gestirlo nel componente
  }
}
