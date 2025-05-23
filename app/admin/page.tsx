import { getRoleFromId } from "@/actions/getUserFromDB";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  const role = await getRoleFromId(session?.user.id ?? "");
  if (session && role?.role === "admin") {
    return (
      <h3 className="text-xl uppercase font-bold text-white">MAIN SECTION</h3>
    );
  } else redirect("/");
}
