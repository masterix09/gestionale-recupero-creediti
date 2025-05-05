"use client";
import { TableCell, TableRow } from "@/components/ui/table";
import React from "react";
import { useRouter } from "next/navigation";

const RowTable = ({
  id,
  email,
  packageType,
  token,
}: {
  id: string;
  email: string;
  packageType: string;
  token: number;
}) => {
  const router = useRouter();
  return (
    <TableRow onClick={() => router.push(`/admin/updateUser/${id}`)}>
      <TableCell className="text-white">{email}</TableCell>
      <TableCell className="text-white">{packageType}</TableCell>
      <TableCell className="text-white">{token}</TableCell>
    </TableRow>
  );
};

export default RowTable;
