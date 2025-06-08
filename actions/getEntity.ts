"use server";

import prisma from "@/lib/db";
import { unstable_noStore } from "next/cache";

// export async function useGetEntity(prevState: any, formData: FormData) {
//   unstable_noStore(); // Disabilita la cache per questa server action

//   if (formData.get("text")?.toString() === "")
//     return [
//       {
//         id: "",
//         CF: "",
//         PIVA: "",
//         nome: "",
//         cognome: "",
//       },
//     ];

//   const data = await prisma.persona.findMany({
//     where: {
//       // CF: formData.get("text")?.toString(),
//       CF: {
//         equals: formData.get("text")?.toString(),
//       },
//     },
//     select: {
//       id: true,
//       nome: true,
//       cognome: true,
//       CF: true,
//       PIVA: true,
//     },
//   });

//   if (data.length > 0) return data;
//   else {
//     const data = await prisma.persona.findMany({
//       where: {
//         PIVA: {
//           equals: formData.get("text")?.toString(),
//         },
//       },
//       select: {
//         id: true,
//         nome: true,
//         cognome: true,
//         CF: true,
//         PIVA: true,
//       },
//     });

//     return data;
//   }
// }

// export async function useGetEntity(prevState: any, formData: FormData) {
//   unstable_noStore();

//   const searchText = formData.get("text")?.toString().trim();

//   if (!searchText)
//     return [
//       {
//         id: "",
//         CF: "",
//         PIVA: "",
//         nome: "",
//         cognome: "",
//       },
//     ];

//   const data = await prisma.persona.findMany({
//     where: {
//       OR: [
//         { nome: { contains: searchText, mode: "insensitive" } },
//         { cognome: { contains: searchText, mode: "insensitive" } },
//         { CF: { equals: searchText } },
//         { PIVA: { equals: searchText } },
//         {
//           idTelefono: {
//             some: {
//               value: {
//                 equals: searchText,
//               },
//             },
//           },
//         },
//       ],
//     },
//     select: {
//       id: true,
//       nome: true,
//       cognome: true,
//       CF: true,
//       PIVA: true,
//       idTelefono: {
//         select: {
//           value: true,
//         },
//       },
//     },
//   });

//   return data;
// }

export async function useGetEntity(prevState: any, formData: FormData) {
  unstable_noStore();

  const nomeCognome = formData.get("nomeCognome")?.toString().trim();
  const telefono = formData.get("telefono")?.toString().trim();
  const piva = formData.get("piva")?.toString().trim();
  const cf = formData.get("cf")?.toString().trim();

  if (!nomeCognome && !telefono && !piva && !cf) {
    return [
      {
        id: "",
        CF: "",
        PIVA: "",
        nome: "",
        cognome: "",
      },
    ];
  }

  let whereClause: any = {};

  if (nomeCognome) {
    whereClause = {
      OR: [
        { nome: { contains: nomeCognome, mode: "insensitive" } },
        { cognome: { contains: nomeCognome, mode: "insensitive" } },
      ],
    };
  } else if (telefono) {
    whereClause = {
      idTelefono: {
        some: {
          value: {
            equals: telefono,
          },
        },
      },
    };
  } else if (piva) {
    whereClause = { PIVA: { equals: piva } };
  } else if (cf) {
    whereClause = { CF: { equals: cf } };
  }

  const data = await prisma.persona.findMany({
    where: whereClause,
    select: {
      id: true,
      nome: true,
      cognome: true,
      CF: true,
      PIVA: true,
      idTelefono: {
        select: {
          value: true,
        },
      },
    },
  });

  return data;
}
