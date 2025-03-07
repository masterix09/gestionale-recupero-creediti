import React from "react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "../ui/button";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import { getRoleFromId } from "@/actions/getUserFromDB";
import { RiMoneyEuroCircleFill } from "@react-icons/all-files/ri/RiMoneyEuroCircleFill";
import { getTokenById } from "@/actions/fetchDatabase";

const Navbar = async () => {
  const sessions = await auth();
  const role = await getRoleFromId(sessions?.user.id ?? "");

  const token = await getTokenById(sessions?.user.id ?? "");

  return (
    <div className="w-full p-3 border-b-2 border-b-white mb-4">
      <div className="w-full lg:w-[80%] mx-auto flex justify-between items-center">
        <Link href="/">
          <h3 className="text-xl font-semibold text-white">
            Gestione recupero crediti
          </h3>
        </Link>
        <div className="flex gap-x-3 justify-center items-center">
          {sessions && role?.role === "admin" && (
            <Link
              href="/admin"
              className="bg-red-800 py-2 px-4 rounded-full text-white"
            >
              ADMNIN
            </Link>
          )}
          {sessions && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirect: true, redirectTo: "/" });
                // redirect("/", RedirectType.replace);
              }}
            >
              <Button
                type="submit"
                className="bg-red-800 py-2 px-4 rounded-full text-white hover:bg-red-800- hover:text-white"
              >
                SIGNOUT
              </Button>
            </form>
          )}
          {role?.role === "user" && (
            <div className="flex gap-x-3">
              <RiMoneyEuroCircleFill className="w-6 h-6 text-white" />
              <span className="text-white font-bold">{token?.token}</span>
            </div>
            // <ViewToken sessions={sessions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
