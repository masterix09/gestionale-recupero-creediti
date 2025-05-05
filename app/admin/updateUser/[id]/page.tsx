import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FormUpdateUser from "./FormUpdateUser";
import { getUserDetail } from "@/actions/fetchDatabase";

export default async function Page({ params }: { params: { id: string } }) {
  const sessions = await auth();
  if (sessions && sessions.user) {
    const data = await getUserDetail(params.id);
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold text-2xl mb-5">
          Modifica Utente
        </h3>

        <FormUpdateUser data={data} id={params.id} />
      </div>
    );
  } else {
    redirect("/");
  }
}
