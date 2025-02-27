import { availableToken, getAnagrafica } from "@/actions/fetchDatabase";
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
    const token = await availableToken("anagrafica");
    if (token && token === "NO") {
      redirect("/");
    }
    const data = await getAnagrafica(params.id);
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold text-2xl mb-5">
          Tabella Anagrafica
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                CF
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                PIVA
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Nome
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Cognome
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Sesso
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Data di Nascita
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Comune di Nascita
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Provincia di Nascita
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Data di Morte
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
            <TableRow>
              <TableCell className="text-white">{data?.CF}</TableCell>
              <TableCell className="text-white">{data?.PIVA}</TableCell>
              <TableCell className="text-white">{data?.nome}</TableCell>
              <TableCell className="text-white">{data?.cognome}</TableCell>
              <TableCell className="text-white">{data?.sesso}</TableCell>
              <TableCell className="text-white">{data?.data_nascita}</TableCell>
              <TableCell className="text-white">
                {data?.comune_nascita}
              </TableCell>
              <TableCell className="text-white">
                {data?.provincia_nascita}
              </TableCell>
              <TableCell className="text-white">{data?.data_morte}</TableCell>
              <TableCell className="text-white">
                {data?.via.at(data.via.length - 1)}
              </TableCell>
              <TableCell className="text-white">
                {data?.comune.at(data.comune.length - 1)}
              </TableCell>
              <TableCell className="text-white">
                {data?.provincia.at(data.provincia.length - 1)}
              </TableCell>
              <TableCell className="text-white">
                {data?.cap.at(data.cap.length - 1)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <h3 className="text-white uppercase font-bold text-2xl mt-[100px]">
          Cronologia Via
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Via
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              // @ts-ignore
              data?.via.map((item, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell className="text-white">{item}</TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>

        <h3 className="text-white uppercase font-bold text-2xl mt-[100px]">
          Cronologia Comune
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Comune
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              // @ts-ignore{
              data?.comune.map((item, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell className="text-white">{item}</TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>

        <h3 className="text-white uppercase font-bold text-2xl mt-[100px]">
          Cronologia Provincia
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Provincia
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              // @ts-ignore
              data?.provincia.map((item, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell className="text-white">{item}</TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>

        <h3 className="text-white uppercase font-bold text-2xl mt-[100px]">
          Cronologia CAP
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                CAP
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              // @ts-ignore
              data?.cap.map((item, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell className="text-white">{item}</TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </div>
    );
  } else {
    redirect("/");
  }
}
