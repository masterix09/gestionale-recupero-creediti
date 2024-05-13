"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { BiCommentDetail } from "@react-icons/all-files/bi/BiCommentDetail";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Entity = {
  id: string;
  nome: string;
  cognome: string;
  codice_fiscale: string;
  telefono: string;
  partita_iva: string;
};

export const columns: ColumnDef<Entity>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "cognome",
    header: "Cognome",
  },
  {
    accessorKey: "codice_fiscale",
    header: "CF",
  },
  {
    accessorKey: "telefono",
    header: "Telefono",
  },
  {
    accessorKey: "partita_iva",
    header: "PIVA",
  },
  {
    header: "Actions",
    cell: ({ row, getValue }) => {
      return (
        <Link href={`/detail/${row.original.id}`}>
          <BiCommentDetail className="bg-green-500 p-2 w-10 h-10 rounded-lg text-white" />
        </Link>
      );
    },
  },
];
