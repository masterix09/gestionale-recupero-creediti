"use server";

import prisma from "@/lib/db";
import { unstable_noStore } from "next/cache";

export async function useGetEntity(prevState: any, formData: FormData) {
  unstable_noStore(); // Disabilita la cache per questa server action

  if (formData.get("text")?.toString() === "")
    return [
      {
        id: "",
        CF: "",
        PIVA: "",
        nome: "",
        cognome: "",
      },
    ];

  const data = await prisma.persona.findMany({
    where: {
      // CF: formData.get("text")?.toString(),
      CF: {
        equals: formData.get("text")?.toString(),
      },
    },
    select: {
      id: true,
      nome: true,
      cognome: true,
      CF: true,
      PIVA: true,
    },
  });

  if (data.length > 0) return data;
  else {
    const data = await prisma.persona.findMany({
      where: {
        PIVA: {
          equals: formData.get("text")?.toString(),
        },
      },
      select: {
        id: true,
        nome: true,
        cognome: true,
        CF: true,
        PIVA: true,
      },
    });

    return data;
  }
}
