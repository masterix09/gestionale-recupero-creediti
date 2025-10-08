"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { v4 as uuid_v4 } from "uuid";

export type TData = {
  CF: string;
  PIVA: string;
  nome: string;
  cognome: string;
  sesso: string;
  comune_nascita: string;
  provincia_nascita: string;
  data_nascita: string;
  data_morte: string;
  via: string;
  cap: string;
  comune: string;
  provincia: string;
  datore: {
    cfPersona: string;
    cfdatore: string;
    tipo: string;
    reddito: string;
    mese: string;
    partTime: string;
    inizio: string;
    fine: string;
    piva: string;
    ragioneSociale: string;
    nome: string;
    via: string;
    cap: string;
    comune: string;
    provincia: string;
  }[];
};

export interface TelefonoInput {
  CF: string;
  Tel1: string;
  Tel2: string;
  Tel3: string;
  Tel4: string;
  Tel5: string;
  Tel6: string;
}

export type PersonaInput = {
  CF: string; // Codice Fiscale (usato anche come ID)
  PIVA: string; // Partita IVA
  Nome: string; // Cognome o Ragione Sociale
  CognomeRagioneSociale: string; // Cognome o Ragione Sociale
  Sesso: string; // Sesso
  ProvinciaNascita: string; // Provincia di nascita
  ComuneNascita: string; // Comune di nascita
  DataNascita: string; // Data di nascita (come stringa, formato ISO)
  DataMorte: string; // Data di morte (come stringa, formato ISO)
  Via: string; // Via (o un elenco di vie, separato da virgole)
  Cap: string; // CAP (o un elenco di CAP, separato da virgole)
  Comune: string; // Comune (o un elenco di comuni, separato da virgole)
  Provincia: string; // Provincia (o un elenco di province, separato da virgole)
  Email: string; // Email
  Pec: string; // Pec
};

export async function addDataToDatore(data: TData[]) {
  try {
    // console.log("Inizio elaborazione di ", data.length, " persone");

    // console.log(
    //   "Numero di datori ",
    //   data.filter((item) => item.datore.at(0)?.cfdatore.length! > 0).length
    // );

    // // Suddividi i record in blocchi da 100
    // const batchSize = 25;
    // const batches = [];

    // // Suddividi i dati in batch
    // for (let i = 0; i < data.length; i += batchSize) {
    //   batches.push(data.slice(i, i + batchSize));
    // }

    // console.log("batches => ", batches.length);

    const dataOnlyCF: string[] = data.map((item) => item.CF);

    const existingDatore = await prisma.datore.findMany({
      where: {
        personaID: {
          in: dataOnlyCF,
        },
      },
    });

    // Esegui ogni batch come una transazione separata
    // for (const batch of batches) {
    const recordsToCreate = [];
    const recordsToUpdate = [];
    for (const item of data) {
      for (const element of item.datore) {
        const {
          cap,
          comune,
          fine,
          inizio,
          mese,
          nome,
          partTime,
          piva,
          provincia,
          ragioneSociale,
          reddito,
          tipo,
          via,
          cfPersona,
          cfdatore,
        } = element;

        // Verifica se il record esiste già
        const existingRecord = existingDatore.find(
          (el) => el.personaID === cfPersona && el.CF === cfdatore
        );

        if (!existingRecord) {
          // Se il record non esiste, aggiungilo all'array
          recordsToCreate.push({
            id: `${uuid_v4().toString()}-${cfPersona ?? "UNKNOW"}`,
            cap: cap?.toString() ?? "",
            CF: cfdatore?.toString() ?? "",
            comune: comune?.toString() ?? "",
            fine: fine?.toString() ?? "",
            inizio: inizio?.toString() ?? "",
            mese: mese?.toString() ?? "",
            nome: nome?.toString() ?? "",
            PIVA: piva?.toString() ?? "",
            provincia: provincia?.toString() ?? "",
            ragione_sociale: ragioneSociale?.toString() ?? "",
            reddito: reddito?.toString() ?? "",
            tipo: tipo?.toString() ?? "",
            tipologia_contratto: partTime?.toString() ?? "",
            via: via?.toString() ?? "",
            personaID: cfPersona,
          });
        } else {
          recordsToUpdate.push({
            where: { id: existingRecord.id },
            data: {
              cap: cap?.toString() ?? "",
              comune: comune?.toString() ?? "",
              fine: fine.toString() ?? "",
              inizio: inizio?.toString() ?? "",
              mese: mese?.toString() ?? "",
              nome: nome?.toString() ?? "",
              PIVA: piva?.toString() ?? "",
              provincia: provincia?.toString() ?? "",
              ragione_sociale: ragioneSociale?.toString() ?? "",
              reddito: reddito?.toString() ?? "",
              tipo: tipo?.toString() ?? "",
              tipologia_contratto: partTime?.toString() ?? "",
              via: via?.toString() ?? "",
              personaID: cfPersona,
            },
          });
        }
      }
    }

    const response = await fetch(
      "https://worker-gestionale-recupero-crediti-ewt7.onrender.com/datore",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordsToCreate,
          recordsToUpdate,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore durante fetch:", response.status, errorText);
      throw new Error("Errore durante l'aggiunta del job Datore");
    }

    const result = await response.json();

    revalidatePath("/category/datore");

    return {
      status: "ok",
      inseriti: result.inseriti,
      aggiornati: result.aggiornati,
      duplicati: result.duplicati,
    };
  } catch (error) {
    console.error("Errore durante l'importazione dei datore:", error);
    // return "errore";

    return {
      status: "errore",
    };
  }
}

function aggiungiSeNonPresente(
  array: string[] | null | undefined,
  valore: string
): string[] {
  if (!array || array.length === 0) return [valore];
  return array.includes(valore) ? array : [...array, valore];
}

export async function importaPersone(personeInput: PersonaInput[]) {
  try {
    console.log("inizio uplaod");

    const response = await fetch(
      // "https://worker-gestionale-recupero-crediti-ewt7.onrender.com/anagrafica",
      "http://db1.ddns.net:32769/anagrafica",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personeInput }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore durante fetch:", response.status, errorText);
      throw new Error("Errore durante l'aggiunta del job Anagrafica");
    }

    const result = await response.json();

    revalidatePath("/category/anagrafica");

    return {
      status: "ok",
      inseriti: result.inseriti,
      aggiornati: result.aggiornati,
      duplicati: result.duplicati,
    };
  } catch (error) {
    console.error("Errore durante l'importazione delle persone:", error);
    // return "errore";

    return {
      status: "errore",
    };
  }
}

export async function importaTelefoni(personeInput: TelefonoInput[]) {
  try {
    const response = await fetch(
      "https://worker-gestionale-recupero-crediti-ewt7.onrender.com/telefono",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persone: personeInput }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore durante fetch:", response.status, errorText);
      throw new Error("Errore durante l'aggiunta del job Telefoni");
    }

    const result = await response.json();

    revalidatePath("/category/telefono");

    return {
      status: "ok",
      inseriti: result.inseriti,
      aggiornati: result.aggiornati,
      duplicati: result.duplicati,
    };
  } catch (error) {
    console.error("Errore durante l'importazione:", error);
    return { status: "errore" };
  }
}

// Funzione per dividere l'array in batch
function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

// export async function updateProcessFileSCP(
//   data: { CF: string; C: string; SC: string; P: string; SP: string }[]
// ) {
//   try {
//     console.log("Inizio elaborazione SCP per ", data.length, " persone");

//     // Suddividi i record in blocchi da 100
//     const batchSize = 100;
//     const batches = [];

//     // Suddividi i dati in batch
//     for (let i = 0; i < data.length; i += batchSize) {
//       batches.push(data.slice(i, i + batchSize));
//     }

//     const dataOnlyCF: string[] = data.map((item) => item.CF);

//     const existingSCP = await prisma.cessionePignoramento.findMany({
//       where: {
//         personaID: {
//           in: dataOnlyCF,
//         },
//       },
//     });

//     // Esegui ogni batch come una transazione separata
//     for (const batch of batches) {
//       const recordsToCreate = [];
//       const recordsToUpdate = [];
//       for (const item of batch) {
//         // Verifica se il record esiste già
//         const existingRecord = existingSCP
//           .filter((el) => el.personaID === item.CF)
//           .at(0);

//         if (!existingRecord) {
//           // Se il record non esiste, aggiungilo all'array
//           recordsToCreate.push({
//             id: item.CF,
//             cessione: item.C.toString(),
//             pignoramento: item.P.toString(),
//             scadenza_cessione: item.SC.toString(),
//             scadenza_pignoramento: item.SP.toString(),
//             personaID: item.CF,
//           });
//         } else {
//           recordsToUpdate.push({
//             where: {
//               id: item.CF,
//             },
//             data: {
//               cessione: item.C.toString(),
//               pignoramento: item.P.toString(),
//               scadenza_cessione: item.SC.toString(),
//               scadenza_pignoramento: item.SP.toString(),
//               personaID: item.CF,
//             },
//           });
//         }
//       }

//       const response = await fetch(
//         "https://worker-gestionale-recupero-crediti.onrender.com/scp",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             recordsToCreate,
//             recordsToUpdate,
//           }),
//         }
//       );

//       if (!response.ok) {
//         console.log("response => ", response);
//         throw new Error("Errore durante l'aggiunta del SCP Create");
//       }
//       // return "OK";
//     }

//     revalidatePath("/category/ultime-scp");
//     console.log("Elaborazione SCP completata con successo");
//     return "OK";
//   } catch (error) {
//     console.error("Errore generale durante l'elaborazione SCP: ", error);
//     return "error";
//   }
// }

export async function updateProcessFileSCP(
  data: { CF: string; C: string; SC: string; P: string; SP: string }[]
) {
  try {
    console.log("Inizio elaborazione SCP per ", data.length, " persone");

    // const batchSize = 100;
    // const batches = [];
    // for (let i = 0; i < data.length; i += batchSize) {
    //   batches.push(data.slice(i, i + batchSize));
    // }

    const dataOnlyCF: string[] = data.map((item) => item.CF);

    const existingSCP = await prisma.cessionePignoramento.findMany({
      where: {
        personaID: {
          in: dataOnlyCF,
        },
      },
    });

    // 🔍 Recupera tutti i personaID validi esistenti in Persona
    const validPersonaIDsInDB = await prisma.persona.findMany({
      where: {
        id: {
          in: dataOnlyCF,
        },
      },
      select: {
        id: true,
      },
    });

    const personaIDSet = new Set(validPersonaIDsInDB.map((p) => p.id));

    // for (const batch of batches) {
    const recordsToCreate = [];
    const recordsToUpdate = [];

    for (const item of data) {
      const personaID = item.CF;

      // ❌ Skippa se personaID non è valido
      if (!personaIDSet.has(personaID)) continue;

      const existingRecord = existingSCP.find(
        (el) => el.personaID === personaID
      );

      if (!existingRecord) {
        recordsToCreate.push({
          id: item.CF,
          cessione: item.C.toString(),
          pignoramento: item.P.toString(),
          scadenza_cessione: item.SC.toString(),
          scadenza_pignoramento: item.SP.toString(),
          personaID: personaID,
        });
      } else {
        recordsToUpdate.push({
          where: { id: item.CF },
          data: {
            cessione: item.C.toString(),
            pignoramento: item.P.toString(),
            scadenza_cessione: item.SC.toString(),
            scadenza_pignoramento: item.SP.toString(),
            personaID: personaID,
          },
        });
      }
    }

    // 🔥 Fai la fetch solo se hai record validi

    const response = await fetch(
      "https://worker-gestionale-recupero-crediti-ewt7.onrender.com/scp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordsToCreate,
          recordsToUpdate,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore durante fetch:", response.status, errorText);
      throw new Error("Errore durante l'aggiunta del job SCP");
    }

    const result = await response.json();

    revalidatePath("/category/ultime-scp");

    return {
      status: "ok",
      inseriti: result.inseriti,
      aggiornati: result.aggiornati,
      duplicati: result.duplicati,
    };
  } catch (error) {
    console.error("Errore durante l'importazione delle SCP:", error);
    // return "errore";

    return {
      status: "errore",
    };
  }
}

export async function updateProcessFileABICAB(
  data: {
    CF: string;
    ABI: string;
    CAB: string;
    Anno: string;
    ABI_1: string;
    CAB_1: string;
    Anno_1: string;
    ABI_2: string;
    CAB_2: string;
    Anno_2: string;
  }[]
) {
  try {
    console.log("Inizio elaborazione ABICAB per ", data.length, " persone");

    // Suddividi i record in blocchi da 100
    const batchSize = 100;
    const batches = [];

    // Suddividi i dati in batch
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    const dataOnlyCF: string[] = data.map((item) => item.CF);

    const existingABICAB = await prisma.abiCab.findMany({
      where: {
        id: {
          in: dataOnlyCF,
        },
      },
    });

    const existingpersonas = await prisma.persona.findMany({
      where: {
        id: {
          in: dataOnlyCF,
        },
      },
      select: {
        id: true,
        CF: true,
        idDatore: true,
      },
    });

    // Esegui ogni batch come una transazione separata
    for (const batch of batches) {
      let recordsToCreate = [];
      let recordsToUpdate = [];
      for (const item of batch) {
        // Verifica se il record esiste già
        const existingRecord = existingABICAB
          .filter((el) => el.id === item.CF)
          .at(0);

        if (!existingRecord) {
          //prendo idDatore da existingPersona
          const datoreID = existingpersonas
            .filter((el) => el.CF === item.CF)
            .at(0)?.idDatore;

          // Se il record non esiste, aggiungilo all'array
          recordsToCreate.push({
            ABI: [
              item.ABI?.toString(),
              item.ABI_1?.toString(),
              item.ABI_2?.toString(),
            ],
            Anno: [
              item.Anno?.toString(),
              item.Anno_1?.toString(),
              item.Anno_2?.toString(),
            ],
            CAB: [
              item.CAB?.toString(),
              item.CAB_1?.toString(),
              item.CAB_2?.toString(),
            ],
            datoreID: datoreID?.at(0)?.id,
            personaID: item.CF,
            id: item.CF,
          });
        } else {
          recordsToUpdate.push({
            where: {
              id: item.CF,
            },
            data: {
              ABI: [
                item.ABI?.toString(),
                item.ABI_1?.toString(),
                item.ABI_2?.toString(),
              ],
              Anno: [
                item.Anno?.toString(),
                item.Anno_1?.toString(),
                item.Anno_2?.toString(),
              ],
              CAB: [
                item.CAB?.toString(),
                item.CAB_1?.toString(),
                item.CAB_2?.toString(),
              ],
              personaID: item.CF,
            },
          });
        }
      }

      // Filtraggio dei record validi per personaID
      const tuttiPersonaID = [
        ...recordsToCreate.map((r) => r.personaID),
        ...recordsToUpdate.map((r) => r.data.personaID),
      ];

      const personaIDsValidiNelDB = await prisma.persona.findMany({
        where: {
          id: { in: tuttiPersonaID },
        },
        select: { id: true },
      });

      const personaIDSet = new Set(personaIDsValidiNelDB.map((p) => p.id));

      const recordsToCreateValidi = recordsToCreate.filter((record) =>
        personaIDSet.has(record.personaID)
      );

      const recordsToUpdateValidi = recordsToUpdate.filter((record) =>
        personaIDSet.has(record.data.personaID)
      );

      const scartati = recordsToCreate.filter(
        (record) => !personaIDSet.has(record.personaID)
      );
      console.log("Record scartati per personaID non trovati:", scartati);

      const response = await fetch(
        "https://worker-gestionale-recupero-crediti-ewt7.onrender.com/AbiCab",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordsToCreate: recordsToCreateValidi,
            recordsToUpdate: recordsToUpdateValidi,
          }),
        }
      );

      if (!response.ok) {
        console.log("response => ", response);
        throw new Error("Errore durante l'aggiunta del ABICAB");
      }
      // return "OK";
    }

    revalidatePath("/category/abicab");
    console.log("Elaborazione ABICAB completata con successo");
    return "OK";
  } catch (error) {
    console.error("Errore generale durante l'elaborazione ABICAB: ", error);
    return "error";
  }
}

export async function uploadCCFile(
  data: { banca: string; nome: string; CF: string }[]
) {
  try {
    console.log("Inizio upload conti correnti per ", data.length, " record");
    // Suddividi i record in blocchi da 100
    const batchSize = 100;
    const batches = [];

    // Suddividi i dati in batch
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    const dataOnlyCF: string[] = data.map((item) => item.CF);

    const existingCC = await prisma.contoCorrente.findMany({
      where: {
        CF: {
          in: dataOnlyCF,
        },
      },
    });

    // Esegui ogni batch come una transazione separata
    for (const batch of batches) {
      const recordsToCreate = [];
      for (const item of batch) {
        // Verifica se il record esiste già
        const existingRecord = existingCC
          .filter((el) => el.CF === item.CF)
          .at(0);

        if (!existingRecord) {
          // Se il record non esiste, aggiungilo all'array
          recordsToCreate.push({
            id: uuid_v4(),
            banca: item.banca,
            CF: item.CF,
            nome: item.nome,
          });
        } else {
          console.log(
            "Conto corrente già esistente per CF: ",
            item.CF,
            ", Banca: ",
            item.banca
          );
        }
      }

      // console.log("recordsToCreate => ", recordsToCreate);
      if (recordsToCreate.length > 0) {
        const response = await fetch(
          "https://worker-gestionale-recupero-crediti-ewt7.onrender.com/contocorrente",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recordsToCreate,
            }),
          }
        );

        if (!response.ok)
          throw new Error("Errore durante l'aggiunta del job contocorrente");
        // return "OK";
      } else {
        console.log("Nessun conto corrente da creare.");
      }
    }
    revalidatePath("/category/cc");

    console.log("Upload conti correnti completato con successo");
    return "OK";
  } catch (error) {
    console.error("Errore durante l'upload dei conti correnti: ", error);
    return "error";
  }
}
