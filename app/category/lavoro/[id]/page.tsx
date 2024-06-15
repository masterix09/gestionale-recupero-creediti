import { getLavoro } from "@/actions/fetchDatabase";
import {
  Table,
  TableBody,
  TableCaption,
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
    const data = await getLavoro(params.id);
    console.log(data);
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold text-2xl mb-5">
          Tabella Lavoro
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                CF
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Tipo
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Reddito
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Mese
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Tipologia Contratto
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Inizio
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Fine
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                PIVA
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Ragione Sociale
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Nome
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Via
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Comune
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Provincia
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                CAP
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell className="text-white">{item?.CF}</TableCell>
                  <TableCell className="text-white">{item?.tipo}</TableCell>
                  <TableCell className="text-white">{item?.reddito}</TableCell>
                  <TableCell className="text-white">{item?.mese}</TableCell>
                  <TableCell className="text-white">
                    {item?.tipologia_contratto}
                  </TableCell>
                  <TableCell className="text-white">{item?.inizio}</TableCell>
                  <TableCell className="text-white">{item?.fine}</TableCell>
                  <TableCell className="text-white">{item?.PIVA}</TableCell>
                  <TableCell className="text-white">
                    {item?.ragione_sociale}
                  </TableCell>
                  <TableCell className="text-white">{item?.nome}</TableCell>
                  <TableCell className="text-white">{item?.via}</TableCell>
                  <TableCell className="text-white">{item?.comune}</TableCell>
                  <TableCell className="text-white">
                    {item?.provincia}
                  </TableCell>
                  <TableCell className="text-white">{item?.cap}</TableCell>
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
