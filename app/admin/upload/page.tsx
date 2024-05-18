"use client";
import {
  updateProcessFile,
  updateProcessFileSCP,
  updateProcessFileTelefono,
} from "@/actions/actionsUpdateFromFile";
import { useRef, useState } from "react";
import XLSX from "xlsx";

export default function Page() {
  const [data, setData] = useState([]);

  const fileRefAnagrafica = useRef<HTMLInputElement | null>(null);
  const fileRefTelefono = useRef<HTMLInputElement | null>(null);
  const fileRefSCP = useRef<HTMLInputElement | null>(null);

  const isExcelFile = (file: { name: any }) => {
    const allowedExtensions = [".xlsx", ".xls"];
    const fileName = file.name;
    const fileExtension = fileName
      .slice(fileName.lastIndexOf("."))
      .toLowerCase();

    return allowedExtensions.includes(fileExtension);
  };

  const handleFileAnagrafica = (e) => {
    console.log(e);
    const file = e.target.files[0];
    console.log(file);

    if (!file) return;

    if (isExcelFile(file) && file.size !== 0) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        const data1 = e.target.result;
        const workbook = XLSX.read(data1, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        console.log(parsedData);
        //@ts-ignore
        setData(parsedData);
        const data = parsedData.map((item) => {
          return {
            // @ts-ignore
            CF: item[`CF`] as string,
            // @ts-ignore
            PIVA: item[`P.IVA`] as string,
            // @ts-ignore
            nome: item[`Nome`] as string,
            // @ts-ignore
            cognome: item[`CognomeRagioneSociale`] as string,
            // @ts-ignore
            sesso: item[`Sesso`] as string,
            // @ts-ignore
            comune_nascita: item[`ComuneNasc'a`] as string,
            // @ts-ignore
            provincia_nascita: item[`ProvNasc'a`] as string,
            // @ts-ignore
            data_nascita: item[`DataNasc'a`] as string,
            // @ts-ignore
            data_morte: item[`DataMorte`] as string,
            // @ts-ignore
            via: item[`Via`] as string,
            // @ts-ignore
            cap: item[`Cap`] as string,
            // @ts-ignore
            comune: item[`Comune`] as string,
            // @ts-ignore
            provincia: item[`Provincia`] as string,
          };
        });
        await updateProcessFile(data);
      };
    }
  };

  // Funzione per trasformare i dati
  const transformArray = (array: { CF: string; [key: string]: string }[]) => {
    return array.map((item) => {
      const { CF, ...tels } = item;
      const telArray = Object.keys(tels)
        .filter((key) => key.startsWith("Tel "))
        .map((key) => tels[key]);

      return { CF, Tel: telArray };
    });
  };

  const handleFileTelefono = (e) => {
    console.log(e);
    const file = e.target.files[0];
    console.log(file);

    if (!file) return;

    if (isExcelFile(file) && file.size !== 0) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        const data1 = e.target.result;
        const workbook = XLSX.read(data1, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: { CF: string; [key: string]: string }[] =
          XLSX.utils.sheet_to_json(sheet, { defval: "" });
        console.log(parsedData);

        // Esegui la trasformazione
        const transformedArray = transformArray(parsedData);

        console.log("transformed array => ", transformedArray);

        //@ts-ignore
        setData(transformedArray);

        await updateProcessFileTelefono(transformedArray);
      };
    }
  };

  const handleFileSCP = (e) => {
    console.log(e);
    const file = e.target.files[0];
    console.log(file);

    if (!file) return;

    if (isExcelFile(file) && file.size !== 0) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        const data1 = e.target.result;
        const workbook = XLSX.read(data1, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        console.log(parsedData);
        //@ts-ignore
        setData(parsedData);
        const data = parsedData.map((item) => {
          return {
            // @ts-ignore
            CF: item[`CF`] as string,
            // @ts-ignore
            C: item[`C`] as string,
            // @ts-ignore
            SC: item[`SC`] as string,
            // @ts-ignore
            P: item[`P`] as string,
            // @ts-ignore
            SP: item[`SP`] as string,
          };
        });
        await updateProcessFileSCP(data);
      };
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-y-8">
      <div>
        <h3 className="text-white text-xl font-semibold">
          Upload Anagrafica - Lavoro
        </h3>
        <input
          type="file"
          name="fileAnagrafica"
          id="fileAnagrafica"
          accept=".xlsx, .xls"
          onChange={handleFileAnagrafica}
          ref={fileRefAnagrafica}
          className="text-white"
        />
      </div>
      <div>
        <h3 className="text-white text-xl font-semibold">Upload Telefono</h3>
        <input
          type="file"
          name="fileTelefono"
          id="fileTelefono"
          accept=".xlsx, .xls"
          onChange={handleFileTelefono}
          ref={fileRefTelefono}
          className="text-white"
        />
      </div>

      <div>
        <h3 className="text-white text-xl font-semibold">Upload SCP</h3>
        <input
          type="file"
          name="fileSCP"
          id="fileSCP"
          accept=".xlsx, .xls"
          onChange={handleFileSCP}
          ref={fileRefSCP}
          className="text-white"
        />
      </div>
    </div>
  );
}
