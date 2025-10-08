"use client";
import React, { useEffect, useRef, useState } from "react";
import ButtonLoading from "../common/ButtonLoading";
import { DataTable } from "@/app/data-table";
import { columns } from "@/app/columns";
import { useGetEntity } from "@/actions/getEntity";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";

const FormRicerca = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [state, formAction] = useFormState(useGetEntity, [
    {
      id: "",
      CF: "",
      PIVA: "",
      nome: "",
      cognome: "",
    },
  ]);

  useEffect(() => {
    state.length === 1 &&
      state.at(0)?.id !== "" &&
      router.push(`/detail/${state.at(0)?.id}`);
  }, [router, state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const nomeCognome = form.nomeCognome.value.trim();
    const telefono = form.telefono.value.trim();
    const pivaCf = form.pivaCf.value.trim();

    const fieldsFilled = [nomeCognome, telefono, pivaCf].filter(
      (val) => val !== ""
    );

    if (fieldsFilled.length !== 1) {
      e.preventDefault();
      setError("Compila solo uno dei campi di ricerca.");
    } else {
      setError("");
    }
  };

  return (
    <div className="mt-10">
      <div className="w-full lg:w-[60%] mx-auto bg-slate-200 rounded-xl p-3 mb-10">
        <h3 className="uppercase font-semibold text-red-800 text-center text-3xl">
          Ricerca
        </h3>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={handleSubmit}
          className="w-full flex flex-col justify-center items-center gap-y-4"
        >
          <input
            name="nomeCognome"
            type="text"
            className="w-full px-3 border-2 border-black rounded-xl py-2"
            placeholder="Nome o Cognome"
          />
          <input
            name="telefono"
            type="text"
            className="w-full px-3 border-2 border-black rounded-xl py-2"
            placeholder="Telefono"
          />
          <input
            name="pivaCf"
            type="text"
            className="w-full px-3 border-2 border-black rounded-xl py-2"
            placeholder="Partita IVA o Codice Fiscale"
          />
          {error && (
            <p className="text-red-600 font-semibold text-center">{error}</p>
          )}
          <ButtonLoading title="CERCA" />
        </form>
      </div>

      {state.length > 1 && state.at(0)?.id !== "" && (
        <DataTable columns={columns} data={state ?? []} />
      )}
    </div>
  );
};

export default FormRicerca;
