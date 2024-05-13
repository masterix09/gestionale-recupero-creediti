import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (session && session.user.role === "admin") {
    return (
      <h3 className="text-xl uppercase font-bold text-white">MAIN SECTION</h3>
    );
  } else redirect("/");
}
