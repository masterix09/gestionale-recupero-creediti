import { getListUser } from "@/actions/fetchDatabase";
import RowTable from "@/components/admin/updateUser/TableRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const sessions = await auth();
  if (sessions && sessions.user) {
    const data = await getListUser();
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold text-2xl mb-5">
          Modifica Utente
        </h3>

        <Table className="rounded-md border-2 border-slate-200">
          <TableHeader>
            <TableRow className="bg-red-800 group hover:bg-red-300">
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Email
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Pacchetto
              </TableHead>
              <TableHead className="text-white group-hover:text-black group-hover:font-bold">
                Token
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              return (
                <RowTable
                  key={item.id}
                  id={item.id}
                  packageType={item.packageType}
                  email={item.email}
                  token={item.token}
                />
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
