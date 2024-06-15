"use server"

import prisma from "@/lib/db"

export async function useGetEntity(prevState: any, formData: FormData) {
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
        
    }
   })
   return data
}