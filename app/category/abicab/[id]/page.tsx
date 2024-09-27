import { availableToken, getABICAB } from "@/actions/fetchDatabase";
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
    const token = await availableToken("anagrafica");
    if (token && token === "NO") {
      redirect("/");
    }
    const data = await getABICAB(params.id);
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold text-2xl mb-5">
          Tabella ABI CAB
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                CF
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                ABI
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                CAB
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Anno
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell className="text-white">{item.id}</TableCell>
                  <TableCell className="text-white">{item.ABI}</TableCell>
                  <TableCell className="text-white">{item.CAB}</TableCell>
                  <TableCell className="text-white">{item.Anno}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  } else {
    redirect("/");
  }
}
