import { getSCP } from "@/actions/fetchDatabase";
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

export default async function Page({ params }: { params: { id: string } }) {
  const sessions = await auth();
  if (sessions && sessions.user) {
    const data = await getSCP(params.id);
    console.log(data);
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold text-2xl mb-5">
          Tabella SCP
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Cessione
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Scadenza Cessione
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Pignoramento
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Scadenza Pignoramento
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-white">{data?.cessione}</TableCell>
              <TableCell className="text-white">
                {data?.scadenza_cessione}
              </TableCell>
              <TableCell className="text-white">{data?.pignoramento}</TableCell>
              <TableCell className="text-white">
                {data?.scadenza_pignoramento}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  } else {
    redirect("/");
  }
}
