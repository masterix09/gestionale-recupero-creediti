"use client";
import React from "react";
import ButtonLoading from "../common/ButtonLoading";
import { DataTable } from "@/app/data-table";
import { columns } from "@/app/columns";
import { useGetEntity } from "@/actions/getEntity";
import { useFormState } from "react-dom";

const FormRicerca = () => {
  const [state, formAction] = useFormState(useGetEntity, [
    {
      id: "string",
      CF: "string",
      PIVA: "string",
      nome: "string",
      cognome: "string",
    },
  ]);
  return (
    <div className="mt-10">
      <div className="w-full lg:w-[60%] mx-auto bg-slate-200 rounded-xl p-3 mb-10">
        <h3 className="uppercase font-semibold text-red-800 text-center text-3xl">
          ricerca
        </h3>
        <form
          action={formAction}
          className="w-full flex flex-col justify-center items-center gap-y-4"
        >
          <input
            name="text"
            type="text"
            className="w-full px-3 border-2 border-black rounded-xl py-2"
            placeholder="Cerca..."
          />
          <ButtonLoading title="CERCA" />
        </form>
      </div>
      <DataTable columns={columns} data={state ?? []} />
    </div>
  );
};

export default FormRicerca;
