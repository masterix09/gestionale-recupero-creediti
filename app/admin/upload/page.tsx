"use client";
import {
  addDataToDatore,
  importaPersone,
  importaTelefoni,
  updateProcessFileABICAB,
  updateProcessFileSCP,
  uploadCCFile,
} from "@/actions/actionsUpdateFromFile";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function Page() {
  const [data, setData] = useState([]);
  const [isPending, setIspending] = useState<boolean>(false);

  const { toast } = useToast();

  const fileRefAnagrafica = useRef<HTMLInputElement | null>(null);
  const fileRefAnagraficaLavoro = useRef<HTMLInputElement | null>(null);
  const fileRefTelefono = useRef<HTMLInputElement | null>(null);
  const fileRefSCP = useRef<HTMLInputElement | null>(null);
  const fileReCC = useRef<HTMLInputElement | null>(null);
  const fileRefABICAB = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [progress, setProgress] = useState<number | null>(null);

  const MAX_XLSX_SIZE_MB = 5; // Limite massimo consigliato per file xlsx

  const isExcelFile = (file: { name: any }) => {
    const allowedExtensions = [".xlsx", ".xls"];
    const fileName = file.name;
    const fileExtension = fileName
      .slice(fileName.lastIndexOf("."))
      .toLowerCase();

    return allowedExtensions.includes(fileExtension);
  };

  // @ts-ignore
  const handleFilePersona = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIspending(true);
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isExcel = fileExtension === "xlsx" || fileExtension === "xls";
    const isCsv = fileExtension === "csv";

    // Se è excel e pesa troppo
    if (isExcel && file.size / (1024 * 1024) > MAX_XLSX_SIZE_MB) {
      toast({
        variant: "destructive",
        title: "📄 File troppo grande!",
        description:
          "Converti il file in formato .CSV per caricarlo correttamente.",
      });
      setIspending(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = async (e) => {
      const buffer = e.target?.result;
      const workbook = XLSX.read(buffer, { type: "array" }); // meglio "array" che "binary"
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });
      // Trasforma i dati per passarli alla server action
      const data = parsedData.map((item) => {
        return {
          //@ts-ignore
          CF: item[`CF`] as string,
          //@ts-ignore
          PIVA: item[`P.IVA`] as string,
          //@ts-ignore
          Nome: item[`Nome`] as string,
          //@ts-ignore
          CognomeRagioneSociale: item[`CognomeRagioneSociale`] as string,
          //@ts-ignore
          Sesso: item[`Sesso`] as string,
          //@ts-ignore
          ProvinciaNascita: item[`ProvNasc'a`] as string,
          //@ts-ignore
          ComuneNascita: item[`ComuneNasc'a`] as string,
          //@ts-ignore
          DataNascita: item[`DataNasc'a`] as string,
          //@ts-ignore
          DataMorte: item[`DataMorte`] as string,
          //@ts-ignore
          Via: item[`Via`] as string,
          //@ts-ignore
          Cap: item[`Cap`] as string,
          //@ts-ignore
          Comune: item[`Comune`] as string,
          //@ts-ignore
          Provincia: item[`Provincia`] as string,
          //@ts-ignore
          Email: item[`Email`] as string,
          //@ts-ignore
          Pec: item[`Pec`] as string,
        };
      });

      // INIZIO DIVISIONE IN BATCH
      const batchSize = 100;
      let total = { inseriti: 0, aggiornati: 0, duplicati: 0 };

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        const res = await importaPersone(batch);

        if (res?.status === "ok") {
          total.inseriti += res.inseriti;
          total.aggiornati += res.aggiornati;
          total.duplicati += res.duplicati;
        } else {
          toast({
            variant: "destructive",
            title: "Errore!",
            description: "Errore durante l'importazione.",
          });
        }
      }

      toast({
        title: "✅ Importazione completata",
        description: `Inseriti: ${total.inseriti}, Aggiornati: ${total.aggiornati}, Duplicati: ${total.duplicati}`,
      });
    };

    setIspending(false);
  };

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setMsg("Caricamento in corso...");

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://db1.ddns.net:8888/upload");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable)
        setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      if (xhr.status >= 200 && xhr.status < 300)
        setMsg("Upload completato. Il NAS importerà i dati a breve.");
      else setMsg("Errore upload: " + xhr.statusText);
    };
    xhr.onerror = () => setMsg("Errore di rete durante l'upload.");
    xhr.send(formData);
  }

  const handleFileAnagraficaLavoro = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIspending(true);

    const file = e.target.files?.[0];
    if (!file) {
      setIspending(false);
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isExcel = fileExtension === "xlsx" || fileExtension === "xls";
    const isCsv = fileExtension === "csv";

    // Se è excel e pesa troppo
    if (isExcel && file.size / (1024 * 1024) > MAX_XLSX_SIZE_MB) {
      toast({
        variant: "destructive",
        title: "📄 File troppo grande!",
        description:
          "Converti il file in formato .CSV per caricarlo correttamente.",
      });
      setIspending(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = async (e) => {
      try {
        const dataBuffer = e?.target?.result;
        if (!dataBuffer) {
          throw new Error("Errore nel caricamento del file");
        }

        const workbook = XLSX.read(dataBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        console.log("sheetName => ", sheetName);

        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error("Nessun foglio trovato nel file");
        }

        const parsedData = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false,
        });
        // parsedData.slice(0, 50).forEach((element, index) => {
        //   console.log(`Elemento ${index}:`, element);
        // });

        if (parsedData.length === 0) {
          toast({
            variant: "destructive",
            title: "⚠️ File vuoto o non valido",
            description: "Controlla che il file contenga dati.",
          });
          setIspending(false);
          return;
        }

        // const totalColumn = Object.keys(parsedData.at(0)!).length;
        // const totalColumnDatore = totalColumn - 14;
        // const counterRowDatore = totalColumnDatore / 16;

        const data = parsedData.map((item: any) => {
          let arrDatore = [];

          arrDatore.push({
            cfPersona: item[`CF`] as string,
            cfdatore: item[`CFDatoreDiLavoro_1`] as string,
            tipo: item[`Tipo_1`] as string,
            reddito: item[`Reddito_1`] as string,
            mese: item[`MESE_1`] as string,
            partTime: item[`PART FULL TIME_1`] as string,
            inizio: item[`Inizio_1`] as string,
            fine: item[`Fine_1`] as string,
            piva: item[`P.IVA_1`] as string,
            ragioneSociale: item[`CognomeRagioneSociale_1`] as string,
            nome: item[`Nome_1`] as string,
            via: item[`Via_1`] as string,
            cap: item[`Cap_1`] as string,
            comune: item[`Comune_1`] as string,
            provincia: item[`Provincia_1`] as string,
          });

          if ((item[`CFDatoreDiLavoro_2`] as string) !== "") {
            arrDatore.push({
              cfPersona: item[`CF`] as string,
              cfdatore: item[`CFDatoreDiLavoro_2`] as string,
              tipo: item[`Tipo_2`] as string,
              reddito: item[`Reddito_2`] as string,
              mese: item[`MESE_2`] as string,
              partTime: item[`PART FULL TIME_2`] as string,
              inizio: item[`Inizio_2`] as string,
              fine: item[`Fine_2`] as string,
              piva: item[`P.IVA_2`] as string,
              ragioneSociale: item[`CognomeRagioneSociale_2`] as string,
              nome: item[`Nome_2`] as string,
              via: item[`Via_2`] as string,
              cap: item[`Cap_2`] as string,
              comune: item[`Comune_2`] as string,
              provincia: item[`Provincia_2`] as string,
            });
          }

          if ((item[`CFDatoreDiLavoro_3`] as string) !== "") {
            arrDatore.push({
              cfPersona: item[`CF`] as string,
              cfdatore: item[`CFDatoreDiLavoro_3`] as string,
              tipo: item[`Tipo_3`] as string,
              reddito: item[`Reddito_3`] as string,
              mese: item[`MESE_3`] as string,
              partTime: item[`PART FULL TIME_3`] as string,
              inizio: item[`Inizio_3`] as string,
              fine: item[`Fine_3`] as string,
              piva: item[`P.IVA_3`] as string,
              ragioneSociale: item[`CognomeRagioneSociale_3`] as string,
              nome: item[`Nome_3`] as string,
              via: item[`Via_3`] as string,
              cap: item[`Cap_3`] as string,
              comune: item[`Comune_3`] as string,
              provincia: item[`Provincia_3`] as string,
            });
          }

          if ((item[`CFDatoreDiLavoro_4`] as string) !== "") {
            arrDatore.push({
              cfPersona: item[`CF`] as string,
              cfdatore: item[`CFDatoreDiLavoro_4`] as string,
              tipo: item[`Tipo_4`] as string,
              reddito: item[`Reddito_4`] as string,
              mese: item[`MESE_4`] as string,
              partTime: item[`PART FULL TIME_4`] as string,
              inizio: item[`Inizio_4`] as string,
              fine: item[`Fine_4`] as string,
              piva: item[`P.IVA_4`] as string,
              ragioneSociale: item[`CognomeRagioneSociale_4`] as string,
              nome: item[`Nome_4`] as string,
              via: item[`Via_4`] as string,
              cap: item[`Cap_4`] as string,
              comune: item[`Comune_4`] as string,
              provincia: item[`Provincia_4`] as string,
            });
          }

          return {
            CF: item[`CF`] as string,
            PIVA: item[`P.IVA`] as string,
            nome: item[`Nome`] as string,
            cognome: item[`CognomeRagioneSociale`] as string,
            sesso: item[`Sesso`] as string,
            comune_nascita: item[`ComuneNasc'a`] as string,
            provincia_nascita: item[`ProvNasc'a`] as string,
            data_nascita: item[`DataNasc'a`] as string,
            data_morte: item[`DataMorte`] as string,
            via: item[`Via`] as string,
            cap: item[`Cap`] as string,
            comune: item[`Comune`] as string,
            provincia: item[`Provincia`] as string,
            datore: arrDatore,
          };
        });

        console.log("Inizio elaborazione di", data.length, "persone");

        const batchSize = 25;
        let total = { inseriti: 0, aggiornati: 0, duplicati: 0 };

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          console.log("i => ", i);
          const res = await addDataToDatore(batch);

          if (res?.status === "ok") {
            total.inseriti += res.inseriti;
            total.aggiornati += res.aggiornati;
            total.duplicati += res.duplicati;
          } else {
            toast({
              variant: "destructive",
              title: "Errore!",
              description: "Errore durante l'importazione.",
            });
          }
        }

        toast({
          title: "✅ Importazione completata",
          description: `Inseriti: ${total.inseriti}, Aggiornati: ${total.aggiornati}, Duplicati: ${total.duplicati}`,
        });
      } catch (error: any) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Errore durante la lettura",
          description: error.message || "Errore sconosciuto",
        });
      } finally {
        setIspending(false);
      }
    };
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

  // @ts-ignore
  const handleFileTelefono = async (e) => {
    setIspending(true);
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isExcel = fileExtension === "xlsx" || fileExtension === "xls";
    const isCsv = fileExtension === "csv";

    // Se è excel e pesa troppo
    if (isExcel && file.size / (1024 * 1024) > MAX_XLSX_SIZE_MB) {
      toast({
        variant: "destructive",
        title: "📄 File troppo grande!",
        description:
          "Converti il file in formato .CSV per caricarlo correttamente.",
      });
      setIspending(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = async (e) => {
      const buffer = e.target?.result;
      const workbook = XLSX.read(buffer, { type: "array" }); // meglio "array" che "binary"
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });

      const data = parsedData.map((item: any) => ({
        CF: item[`CF`] ?? "",
        Tel1: item[`Tel 1`] ?? "",
        Tel2: item[`Tel 2`] ?? "",
        Tel3: item[`Tel 3`] ?? "",
        Tel4: item[`Tel 4`] ?? "",
        Tel5: item[`Tel 5`] ?? "",
        Tel6: item[`Tel 6`] ?? "",
      }));

      const batchSize = 100;
      const total = {
        inseriti: 0,
        aggiornati: 0,
        eliminati: 0,
      };

      for (let i = 0; i < data.length; i += batchSize) {
        const chunk = data.slice(i, i + batchSize);
        const res = await importaTelefoni(chunk);

        if (res?.status === "ok") {
          total.inseriti += res.inseriti ?? 0;
          total.aggiornati += res.aggiornati ?? 0;
          total.eliminati += res.duplicati ?? 0;
        } else {
          toast({
            variant: "destructive",
            title: "Errore batch",
            description: `Errore durante il batch ${i / batchSize + 1}`,
          });
        }
      }

      toast({
        title: "✅ Importazione completata",
        description: `Inseriti: ${total.inseriti}, Aggiornati: ${total.aggiornati}, Eliminati: ${total.eliminati}`,
      });
      setIspending(false);
    };
  };

  // @ts-ignore
  const handleFileSCP = (e) => {
    setIspending(true);
    // console.log(e);
    const file = e.target.files[0];
    // console.log(file);

    if (!file) return;

    if (isExcelFile(file) && file.size !== 0) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        // @ts-ignore
        const data1 = e.target.result;
        const workbook = XLSX.read(data1, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        // console.log(parsedData);
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

        // INIZIO DIVISIONE IN BATCH
        const batchSize = 100;
        let total = { inseriti: 0, aggiornati: 0, duplicati: 0 };

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          const res = await updateProcessFileSCP(batch);
          if (res?.status === "ok") {
            total.inseriti += res.inseriti;
            total.aggiornati += res.aggiornati;
            total.duplicati += res.duplicati;
          } else {
            toast({
              variant: "destructive",
              title: "Errore!",
              description: "Errore durante l'importazione.",
            });
          }
        }

        toast({
          title: "✅ Importazione completata",
          description: `Inseriti: ${total.inseriti}, Aggiornati: ${total.aggiornati}, Duplicati: ${total.duplicati}`,
        });
      };
    }
    setIspending(false);
  };

  // @ts-ignore
  const handleFileABICAB = (e) => {
    setIspending(true);
    // console.log(e);
    const file = e.target.files[0];
    // console.log(file);

    if (!file) return;

    if (isExcelFile(file) && file.size !== 0) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        // @ts-ignore
        const data1 = e.target.result;
        const workbook = XLSX.read(data1, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        // console.log("parsed => ", parsedData);
        //@ts-ignore
        setData(parsedData);
        const data = parsedData.map((item) => {
          return {
            // @ts-ignore
            CF: item[`Codice Fiscale`] as string,
            // @ts-ignore
            ABI: item[`ABI`] as string,
            // @ts-ignore
            CAB: item[`CAB`] as string,
            // @ts-ignore
            Anno: item[`Anno`] as string,
            // @ts-ignore
            ABI_1: item[`ABI_1`] as string,
            // @ts-ignore
            CAB_1: item[`CAB_1`] as string,
            // @ts-ignore
            Anno_1: item[`Anno_1`] as string,
            // @ts-ignore
            ABI_2: item[`ABI_2`] as string,
            // @ts-ignore
            CAB_2: item[`CAB_2`] as string,
            // @ts-ignore
            Anno_2: item[`Anno_2`] as string,
          };
        });

        const res = await updateProcessFileABICAB(data);

        if (res === "OK") {
          toast({
            title: "Successo!",
            description: "Operazione avvenuta con successo",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Ops ! Errore!",
            description: "Errore operazione. Riprova!",
          });
        }
      };
    }
    setIspending(false);
  };

  // @ts-ignore
  const handleFileCC = (e) => {
    setIspending(true);
    // console.log(e);
    const file = e.target.files[0];
    // console.log(file);

    if (!file) return;

    if (isExcelFile(file) && file.size !== 0) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        // @ts-ignore
        const data1 = e.target.result;
        const workbook = XLSX.read(data1, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        // console.log("parsed => ", parsedData);
        //@ts-ignore
        setData(parsedData);
        const data = parsedData.map((item) => {
          return {
            // @ts-ignore
            banca: item[`BANCA`] as string,
            // @ts-ignore
            CF: item[`CF`] as string,
            // @ts-ignore
            nome: item[`NOME`] as string,
          };
        });

        const res = await uploadCCFile(data);
        if (res === "OK") {
          toast({
            title: "Successo!",
            description: "Operazione avvenuta con successo",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Ops ! Errore!",
            description: "Errore operazione. Riprova!",
          });
        }
      };
    }
    setIspending(false);
  };

  return (
    <>
      {isPending && <LoadingSpinner />}
      <div className="h-full w-full flex flex-col gap-y-8">
        <div>
          <h3 className="text-white text-xl font-semibold">
            Upload Anagrafica
          </h3>
          {/* <input
            type="file"
            name="fileAnagrafica"
            id="fileAnagrafica"
            accept=".xlsx, .xls"
            onChange={handleFilePersona}
            ref={fileRefAnagrafica}
            className="text-white"
          /> */}
          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button type="submit" disabled={!file}>
              Carica
            </button>
          </form>
          {progress !== null && <p>Progress: {progress}%</p>}
          <p>{msg}</p>
        </div>
        <div>
          <h3 className="text-white text-xl font-semibold">Upload Lavoro</h3>
          <input
            type="file"
            name="fileAnagrafica"
            id="fileAnagrafica"
            accept=".xlsx, .xls"
            onChange={handleFileAnagraficaLavoro}
            ref={fileRefAnagraficaLavoro}
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
        <div>
          <h3 className="text-white text-xl font-semibold">Upload ABI CAB</h3>
          <input
            type="file"
            name="fileABICAB"
            id="fileABICAB"
            accept=".xlsx, .xls"
            onChange={handleFileABICAB}
            ref={fileRefABICAB}
            className="text-white"
          />
        </div>
        <div>
          <h3 className="text-white text-xl font-semibold">Upload CC</h3>
          <input
            type="file"
            name="fileCC"
            id="fileCC"
            accept=".xlsx, .xls"
            onChange={handleFileCC}
            ref={fileReCC}
            className="text-white"
          />
        </div>
      </div>
    </>
  );
}
