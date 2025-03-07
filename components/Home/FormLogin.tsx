"use client";
import { signIn } from "@/lib/auth";
import ButtonLoading from "../common/ButtonLoading";
import { useState } from "react";
import { login } from "@/actions/getUserFromDB";

const FormLogin = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <>
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-black">
        <div className="w-full lg:w-[60%] mx-auto flex flex-col justify-center items-center">
          {errorMessage && (
            <div className="border-2 border-red-500 bg-red-200 rounded-md w-1/2 mx-auto mb-5 p-2">
              <span className="text-center text-red-500 text-lg md:text-2xl font-semibold">
                {errorMessage}
              </span>
            </div>
          )}
          <div className="w-[50%] mx-auto bg-slate-200 rounded-xl">
            <h2 className="text-black py-3 text-center text-3xl font-semibold">
              Accedi
            </h2>
            <form
              action={async (formData) => {
                setErrorMessage(null);
                try {
                  await signIn("credentials", formData);
                  console.log("Login riuscito");
                } catch (error: any) {
                  console.log("Login fallito");
                  setErrorMessage("Errore di login");
                }
              }}
              className="w-full flex flex-col gap-y-4 p-3"
            >
              <input type="hidden" name="redirectTo" value="/" />
              <input
                name="email"
                type="email"
                className="w-full px-3 border-2 border-black rounded-xl py-2"
                placeholder="email"
              />
              <input
                name="password"
                type="password"
                className="w-full px-3 border-2 border-black rounded-xl py-2"
                placeholder="password"
              />
              <ButtonLoading title="LOGIN" />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormLogin;
