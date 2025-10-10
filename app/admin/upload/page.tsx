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
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({
    message: "",
    type: ""
  });

  // Gestione della selezione del file
  //@ts-ignore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setStatus({ message: `File pronto: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`, type: 'info' });
    } else {
        setFile(null);
        setStatus({ message: 'Seleziona un file CSV valido.', type: 'error' });
    }
    setProgress(0);
};

// Funzione principale di upload
const handleUpload = async () => {
    if (!file) {
        setStatus({ message: 'Seleziona un file prima di avviare il caricamento.', type: 'error' });
        return;
    }

    setUploading(true);
    setProgress(0);
    setStatus({ message: 'Passaggio 1/2: Richiesta URL firmata...', type: 'info' });

    try {
        // 1. CHIAMATA AL BACKEND: Ottieni l'URL firmata
        const response = await fetch('/api/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type || 'text/csv',
            }),
        });

        if (!response.ok) {
            throw new Error('Impossibile ottenere l\'URL firmata.');
        }

        const { signedUrl, fileKey } = await response.json();

        setStatus({ message: `Passaggio 2/2: Caricamento diretto su R2 in corso... (${fileKey})`, type: 'info' });

        // 2. UPLOAD DIRETTO SU R2 TRAMITE URL FIRMATA (PUT)
        await uploadFileWithProgress(signedUrl, file, setProgress);

        setStatus({ 
            message: `Caricamento completato con successo! Il Job Processor sta elaborando il file in ${fileKey}.`, 
            type: 'success' 
        });
        setFile(null); // Pulisce il file selezionato
        
    } catch (error) {
        console.error('Errore di Upload:', error);

        let errorMessage = 'Caricamento fallito. Controlla la console.';
        if (error instanceof Error && error.message) {
            errorMessage = `Caricamento fallito. ${error.message}. Controlla la console.`;
        }

        setStatus({ 
            message: errorMessage, 
            type: 'error' 
        });
    } finally {
        setUploading(false);
    }
};

// Helper per l'upload con tracciamento del progresso (usando XHR)
//@ts-ignore
const uploadFileWithProgress = (url: string, file: File, setProgressCallback: (percent: number) => void) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);

        // Importante per R2/S3
        xhr.setRequestHeader('Content-Type', file.type || 'text/csv');
        
        // Tracciamento del progresso
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                setProgressCallback(percent);
            }
        };

        // Gestione del completamento o errore
        xhr.onload = () => {
            // S3/R2 risponde con 200 OK
            if (xhr.status >= 200 && xhr.status < 300) {
                setProgressCallback(100);
                //@ts-ignore
                resolve();
            } else {
                reject(new Error(`Errore HTTP ${xhr.status} durante l'upload diretto su R2.`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Errore di rete o di connessione durante l\'upload.'));
        };

        // Avvia l'invio del file
        xhr.send(file);
    });
};

// Stili dinamici per lo status
//@ts-ignore
const getStatusClasses = (type: string) => {
    if (type === 'success') return 'bg-green-100 text-green-800';
    if (type === 'error') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
};


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

  async function handleUpload2(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setMsg("Caricamento in corso...");

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "https://db1.ddns.net:32813/upload");
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

          {/* <form onSubmit={handleUpload2}>
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
          <p>{msg}</p> */}

          {/* <h1>Carica File CSV (Max 1GB)</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
            <button
              type="submit"
              disabled={!file || status.includes("Caricamento in corso")}
            >
              Carica 1.000.000 Record
            </button>
          </form>
          <p style={{ marginTop: 20, fontWeight: "bold" }}>Stato: {status}</p>
          <small>L&apos;elaborazione avverrà in background sul NAS QNAP.</small> */}

          {/* File Input Area */}
          <div className="space-y-4">
                    <input 
                        type="file" 
                        id="csvFile" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={uploading}
                    />
                    
                    <label 
                        htmlFor="csvFile" 
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition duration-150 
                            ${uploading ? 'bg-gray-200 border-gray-400' : 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'}`}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <p className="mb-2 text-sm text-indigo-500"><span className="font-semibold">Clicca per selezionare</span></p>
                            <p className="text-xs text-gray-500">{file ? `Selezionato: ${file.name}` : 'Nessun file selezionato'}</p>
                        </div>
                    </label>
                    
                    <button 
                        id="uploadButton" 
                        onClick={handleUpload} 
                        className="w-full px-5 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition duration-150 shadow-md disabled:bg-indigo-400"
                        disabled={!file || uploading}>
                        {uploading ? 'Caricamento in corso...' : 'Avvia Caricamento Massivo'}
                    </button>
                </div>

                {/* Status and Progress Area */}
                <div id="statusContainer" className="mt-6 space-y-3">
                    <div id="uploadStatus" className={`p-3 rounded-lg text-sm font-medium ${getStatusClasses(status.type)}`}>
                        {status.message}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div id="progressBar" 
                             className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                             style={{ width: `${progress}%` }}>
                        </div>
                    </div>
                    <p id="progressText" className="text-xs text-gray-500 text-right">{Math.round(progress ?? 0)}%</p>
                </div>
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
