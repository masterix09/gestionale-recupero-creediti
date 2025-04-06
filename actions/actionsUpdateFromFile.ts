"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { v4 as uuid_v4 } from "uuid";

type TData = {
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

interface TelefonoInput {
  CF: string;
  Tel1: string;
  Tel2: string;
  Tel3: string;
  Tel4: string;
  Tel5: string;
  Tel6: string;
}

type PersonaInput = {
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
};

export async function addDataToDatore(data: TData[]) {
  try {
    console.log("Inizio elaborazione di ", data.length, " persone");

    console.log(
      "Numero di datori ",
      data.filter((item) => item.datore.at(0)?.cfdatore.length! > 0).length
    );

    // Suddividi i record in blocchi da 100
    const batchSize = 25;
    const batches = [];

    // Suddividi i dati in batch
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    console.log("batches => ", batches.length);

    const dataOnlyCF: string[] = data.map((item) => item.CF);

    const existingDatore = await prisma.datore.findMany({
      where: {
        personaID: {
          in: dataOnlyCF,
        },
      },
    });

    // Esegui ogni batch come una transazione separata
    for (const batch of batches) {
      const recordsToCreate = [];
      const recordsToUpdate = [];
      for (const item of batch) {
        for (const element of item.datore) {
          // Verifica se il record esiste già
          const existingRecord = existingDatore
            .filter((el) => el.personaID === item.CF)
            .at(0);

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

          if (!existingRecord) {
            // Se il record non esiste, aggiungilo all'array
            recordsToCreate.push({
              id: `${uuid_v4().toString()}-${cfPersona ?? "UNKNOW"}`,
              cap: cap?.toString() ?? "",
              CF: cfdatore?.toString() ?? "",
              comune,
              fine,
              inizio,
              mese: mese?.toString() ?? "",
              nome,
              PIVA: piva?.toString(),
              provincia,
              ragione_sociale: ragioneSociale?.toString(),
              reddito: reddito?.toString() ?? "",
              tipo,
              tipologia_contratto: partTime?.toString(),
              via,
              personaID: cfPersona,
            });
          } else {
            recordsToUpdate.push({
              where: { id: existingRecord.id },
              data: {
                cap: cap?.toString() ?? "",
                comune,
                fine,
                inizio,
                mese: mese?.toString() ?? "",
                nome,
                PIVA: piva?.toString(),
                provincia,
                ragione_sociale: ragioneSociale?.toString(),
                reddito: reddito?.toString() ?? "",
                tipo,
                tipologia_contratto: partTime?.toString(),
                via,
              },
            });
          }
        }
      }

      const response = await fetch(
        "https://worker-gestionale-recupero-crediti.onrender.com/datore",
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
        console.log(response);
        throw new Error("Errore durante l'aggiunta del Datore Create");
      }
      // return "OK";
    }

    revalidatePath(`/category/lavoro`);

    console.log("Elaborazione completata con successo");
    return "OK";
  } catch (error) {
    console.error("Errore generale durante l'elaborazione: ", error);
    return "error";
  }
}

// export async function importaPersone(personeInput: PersonaInput[]) {
//   try {
//     // Suddividi i record in blocchi da 100
//     const batchSize = 100;
//     const batches = [];

//     // Suddividi i dati in batch
//     for (let i = 0; i < personeInput.length; i += batchSize) {
//       batches.push(personeInput.slice(i, i + batchSize));
//     }

//     // Esegui ogni batch come una transazione separata
//     for (const batch of batches) {
//       await prisma.$transaction(async (prisma) => {
//         // Imposta il timeout delle transazioni
//         await prisma.$executeRaw`SET statement_timeout = 30000;`; // Impostato a 30 secondi

//         // 1. Estrai tutti i CF unici dal file Excel per il batch corrente
//         const cfUnici = Array.from(new Set(batch.map((p) => p.CF)));

//         // 2. Ottieni tutte le persone esistenti nel DB per il batch
//         const personeEsistenti = await prisma.persona.findMany({
//           where: {
//             CF: { in: cfUnici },
//           },
//         });

//         // 3. Organizza le operazioni di creazione e aggiornamento
//         const personeDaCreare = [];
//         const personeDaAggiornare = [];

//         for (const personaInput of batch) {
//           // Verifica se la persona esiste
//           const personaEsistente = personeEsistenti.find(
//             (p) => p.CF === personaInput.CF
//           );

//           const personaData = {
//             id: personaInput.CF, // Aggiunto campo id uguale al CF
//             CF: personaInput.CF,
//             PIVA: personaInput.PIVA.toString(),
//             cognome: personaInput.CognomeRagioneSociale.toString(), // nome della società
//             nome: personaInput.Nome.toString(), // nome della società
//             sesso: personaInput.Sesso.toString(),
//             comune_nascita: personaInput.ComuneNascita.toString(),
//             provincia_nascita: personaInput.ProvinciaNascita.toString(),
//             data_nascita: personaInput.DataNascita.toString(),
//             data_morte: personaInput.DataMorte.toString(),
//             via: personaEsistente
//               ? personaEsistente?.via?.length > 0
//                 ? personaEsistente.via.at(personaEsistente.via.length) ===
//                   personaInput.Via.toString()
//                   ? personaEsistente.via
//                   : [...personaEsistente?.via, personaInput.Via.toString()]
//                 : [personaInput.Via.toString()]
//               : [personaInput.Via.toString()], // supponiamo che sia una lista di vie
//             cap: personaEsistente
//               ? personaEsistente?.cap?.length > 0
//                 ? personaEsistente.cap.at(personaEsistente.cap.length) ===
//                   personaInput.Cap.toString()
//                   ? personaEsistente.cap
//                   : [...personaEsistente?.cap, personaInput.Cap.toString()]
//                 : [personaInput.Cap.toString()]
//               : [personaInput.Cap.toString()], // supponiamo che sia una lista di CAP
//             comune: personaEsistente
//               ? personaEsistente?.comune?.length > 0
//                 ? personaEsistente.comune.at(personaEsistente.comune.length) ===
//                   personaInput.Comune.toString()
//                   ? personaEsistente.comune
//                   : [
//                       ...personaEsistente?.comune,
//                       personaInput.Comune.toString(),
//                     ]
//                 : [personaInput.Comune.toString()]
//               : [personaInput.Comune.toString()], // supponiamo che sia una lista di comuni
//             provincia: personaEsistente
//               ? personaEsistente?.provincia?.length > 0
//                 ? personaEsistente.provincia.at(
//                     personaEsistente.provincia.length
//                   ) === personaInput.Provincia.toString()
//                   ? personaEsistente.provincia
//                   : [
//                       ...personaEsistente?.provincia,
//                       personaInput.Provincia.toString(),
//                     ]
//                 : [personaInput.Provincia.toString()]
//               : [personaInput.Provincia.toString()], // supponiamo che sia una lista di province
//           };

//           if (personaEsistente) {
//             // 4. Se la persona esiste, aggiungiamo l'operazione di aggiornamento
//             personeDaAggiornare.push({
//               where: { CF: personaInput.CF },
//               data: personaData,
//             });
//           } else {
//             // 5. Se la persona non esiste, la aggiungiamo all'elenco di creazione
//             personeDaCreare.push(personaData);
//           }
//         }

//         console.log("faccio la chiamata");

//         const response = await fetch(
//           "https://worker-gestionale-recupero-crediti.onrender.com/anagrafica",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ personeDaCreare, personeDaAggiornare }),
//           }
//         );

//         if (!response.ok)
//           throw new Error("Errore durante l'aggiunta del job Anagrafica");
//         return "OK";
//       });
//     }

//     revalidatePath("/category/anagrafica");
//     return "OK";
//   } catch (error) {
//     console.error("Errore durante l'importazione delle persone:", error);
//     return "errore";
//   }
// }

export async function importaPersone(personeInput: PersonaInput[]) {
  try {
    const batchSize = 100;

    for (let i = 0; i < personeInput.length; i += batchSize) {
      const batch = personeInput.slice(i, i + batchSize);

      // --- 1. Estrai i CF unici del batch
      const cfUnici = Array.from(new Set(batch.map((p) => p.CF)));

      // --- 2. Recupera le persone esistenti dal DB
      const personeEsistenti = await prisma.persona.findMany({
        where: { CF: { in: cfUnici } },
      });

      // --- 3. Prepara dati per creazione/aggiornamento
      const personeDaCreare: any[] = [];
      const personeDaAggiornare: any[] = [];

      for (const personaInput of batch) {
        const personaEsistente = personeEsistenti.find(
          (p) => p.CF === personaInput.CF
        );

        const nuovaVia = personaInput.Via.toString();
        const nuovaCap = personaInput.Cap.toString();
        const nuovoComune = personaInput.Comune.toString();
        const nuovaProvincia = personaInput.Provincia.toString();

        const personaData = {
          id: personaInput.CF, // Aggiunto campo id uguale al CF
          CF: personaInput.CF,
          PIVA: personaInput.PIVA.toString(),
          cognome: personaInput.CognomeRagioneSociale.toString(), // nome della società
          nome: personaInput.Nome.toString(), // nome della società
          sesso: personaInput.Sesso.toString(),
          comune_nascita: personaInput.ComuneNascita.toString(),
          provincia_nascita: personaInput.ProvinciaNascita.toString(),
          data_nascita: personaInput.DataNascita.toString(),
          data_morte: personaInput.DataMorte.toString(),
          via: personaEsistente
            ? personaEsistente?.via?.length > 0
              ? personaEsistente.via.at(personaEsistente.via.length) ===
                personaInput.Via.toString()
                ? personaEsistente.via
                : [...personaEsistente?.via, personaInput.Via.toString()]
              : [personaInput.Via.toString()]
            : [personaInput.Via.toString()], // supponiamo che sia una lista di vie
          cap: personaEsistente
            ? personaEsistente?.cap?.length > 0
              ? personaEsistente.cap.at(personaEsistente.cap.length) ===
                personaInput.Cap.toString()
                ? personaEsistente.cap
                : [...personaEsistente?.cap, personaInput.Cap.toString()]
              : [personaInput.Cap.toString()]
            : [personaInput.Cap.toString()], // supponiamo che sia una lista di CAP
          comune: personaEsistente
            ? personaEsistente?.comune?.length > 0
              ? personaEsistente.comune.at(personaEsistente.comune.length) ===
                personaInput.Comune.toString()
                ? personaEsistente.comune
                : [...personaEsistente?.comune, personaInput.Comune.toString()]
              : [personaInput.Comune.toString()]
            : [personaInput.Comune.toString()], // supponiamo che sia una lista di comuni
          provincia: personaEsistente
            ? personaEsistente?.provincia?.length > 0
              ? personaEsistente.provincia.at(
                  personaEsistente.provincia.length
                ) === personaInput.Provincia.toString()
                ? personaEsistente.provincia
                : [
                    ...personaEsistente?.provincia,
                    personaInput.Provincia.toString(),
                  ]
              : [personaInput.Provincia.toString()]
            : [personaInput.Provincia.toString()], // supponiamo che sia una lista di province
        };

        if (personaEsistente) {
          personeDaAggiornare.push({
            where: { CF: personaInput.CF },
            data: personaData,
          });
        } else {
          personeDaCreare.push(personaData);
        }
      }

      // --- 4. Effettua la chiamata esterna fuori dalla transazione
      console.log("faccio la chiamata");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        "https://worker-gestionale-recupero-crediti.onrender.com/anagrafica",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ personeDaCreare, personeDaAggiornare }),
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Errore durante fetch:", response.status, errorText);
        throw new Error("Errore durante l'aggiunta del job Anagrafica");
      }
    }

    revalidatePath("/category/anagrafica");
    return "OK";
  } catch (error) {
    console.error("Errore durante l'importazione delle persone:", error);
    return "errore";
  }
}

export async function importaTelefoni(personeInput: TelefonoInput[]) {
  try {
    const batchSize = 100; // Per evitare timeout
    const chunks = chunkArray(personeInput, batchSize);

    for (const batch of chunks) {
      await prisma.$transaction(async (prisma) => {
        // 1️⃣ Ottieni tutti i CF unici nel batch
        const cfUnici = Array.from(new Set(batch.map((p) => p.CF)));

        // 2️⃣ Trova solo le persone esistenti nel database
        const personeEsistenti = await prisma.persona.findMany({
          where: { CF: { in: cfUnici } },
          select: { id: true, CF: true },
        });

        // Crea una mappa di CF -> ID Persona
        const personaIdMap = new Map(personeEsistenti.map((p) => [p.CF, p.id]));

        // 3️⃣ Trova tutti i telefoni esistenti per queste persone
        const personaIds = Array.from(personaIdMap.values());
        const telefoniEsistenti = await prisma.telefono.findMany({
          where: { personaID: { in: personaIds } },
          select: { id: true, value: true, personaID: true },
        });

        // Crea una mappa di personaID -> [Telefoni esistenti]
        const telefoniEsistentiMap = new Map<
          string,
          { id: string; value: string }[]
        >();
        telefoniEsistenti.forEach((t) => {
          if (!telefoniEsistentiMap.has(t.personaID!)) {
            telefoniEsistentiMap.set(t.personaID!, []);
          }
          telefoniEsistentiMap.get(t.personaID!)!.push(t);
        });

        // 4️⃣ Prepara i dati per l'update e la creazione dei telefoni
        const telefoniDaCreare: Prisma.TelefonoCreateManyInput[] = [];
        const telefoniDaAggiornare: { id: string; value: string }[] = [];
        const telefoniDaEliminare: string[] = [];

        for (const persona of batch) {
          const personaID = personaIdMap.get(persona.CF);
          if (!personaID) {
            // Se la persona non esiste, ignora i suoi telefoni
            console.warn(
              `Persona con CF ${persona.CF} non trovata, ignorando i telefoni`
            );
            continue;
          }

          // Telefoni presenti nel file
          const nuoviNumeri = [
            persona.Tel1,
            persona.Tel2,
            persona.Tel3,
            persona.Tel4,
            persona.Tel5,
            persona.Tel6,
          ].filter(Boolean);
          const telefoniAttuali = telefoniEsistentiMap.get(personaID) || [];

          // 5️⃣ Decide se aggiornare, creare o eliminare telefoni
          for (let i = 0; i < nuoviNumeri.length; i++) {
            const numero = nuoviNumeri[i]!;
            if (telefoniAttuali[i]) {
              if (telefoniAttuali[i].value !== numero) {
                telefoniDaAggiornare.push({
                  id: telefoniAttuali[i].id,
                  value: numero,
                });
              }
            } else {
              telefoniDaCreare.push({
                id: `${personaID}-${numero}`,
                value: numero,
                personaID: personaID,
              });
            }
          }

          // Se ci sono più telefoni nel DB di quelli nuovi, rimuoviamo quelli extra
          if (telefoniAttuali.length > nuoviNumeri.length) {
            telefoniDaEliminare.push(
              ...telefoniAttuali.slice(nuoviNumeri.length).map((t) => t.id)
            );
          }
        }

        const response = await fetch(
          "https://worker-gestionale-recupero-crediti.onrender.com/telefono",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              telefoniDaCreare,
              telefoniDaAggiornare,
              telefoniDaEliminare,
            }),
          }
        );

        if (!response.ok)
          throw new Error("Errore durante l'aggiunta del job Telefono");
        return "OK";
      });
    }

    revalidatePath("/category/telefono");
    return "OK";
  } catch (error) {
    console.error("Errore durante l'importazione:", error);
    return "errore";
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

    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

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

    for (const batch of batches) {
      const recordsToCreate = [];
      const recordsToUpdate = [];

      for (const item of batch) {
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
      if (recordsToCreate.length > 0 || recordsToUpdate.length > 0) {
        const response = await fetch(
          "https://worker-gestionale-recupero-crediti.onrender.com/scp",
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
          console.log("response => ", response);
          throw new Error("Errore durante l'aggiunta del SCP Create");
        }
      }
    }

    revalidatePath("/category/ultime-scp");
    console.log("Elaborazione SCP completata con successo");
    return "OK";
  } catch (error) {
    console.error("Errore generale durante l'elaborazione SCP: ", error);
    return "error";
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
        "https://worker-gestionale-recupero-crediti.onrender.com/AbiCab",
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
          "https://worker-gestionale-recupero-crediti.onrender.com/contocorrente",
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
