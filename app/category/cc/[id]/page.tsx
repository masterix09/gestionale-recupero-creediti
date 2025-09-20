import { checkTokenAndData, getCC } from "@/actions/fetchDatabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NoDataMessage from "@/components/common/NoDataMessage";

export default async function Page({ params }: { params: { id: string } }) {
  const sessions = await auth();
  if (sessions && sessions.user) {
    const tokenCheck = await checkTokenAndData("cc", params.id);

    // Se non ci sono token sufficienti, reindirizza
    if (tokenCheck === "NO") {
      redirect("/");
    }

    // Se non ci sono dati, mostra messaggio informativo
    if (tokenCheck === "NO_DATA") {
      return (
        <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
          <h3 className="text-white uppercase font-bold text-2xl mb-5">
            Tabella CC
          </h3>
          <NoDataMessage category="cc" />
        </div>
      );
    }
    const data = await getCC(params.id);
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold text-2xl mb-5">
          Tabella CC
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                CF
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Nome
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Banca
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-white">{data?.CF}</TableCell>
              <TableCell className="text-white">{data?.nome}</TableCell>
              <TableCell className="text-white">{data?.banca}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  } else {
    redirect("/");
  }
}
