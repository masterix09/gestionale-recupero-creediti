import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { categories: string; id: string };
}) {
  const sessions = await auth();

  if (sessions && sessions.user) {
    return (
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <h3 className="text-white uppercase font-bold">{params.categories}</h3>
        <h3 className="text-white uppercase font-bold">{params.id}</h3>
      </div>
    );
  } else {
    redirect("/");
  }
}
