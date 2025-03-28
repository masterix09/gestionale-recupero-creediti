"use server";

import prisma from "@/lib/db";
import { personaQueue } from "@/lib/queue.mjs";
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

    const recordsToCreate = [];
    const recordsToUpdate = [];

    for (const persona of data) {
      for (const datore of persona.datore) {
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
        } = datore;

        // Verifica se il record esiste già
        const existingRecord = await prisma.datore.findFirst({
          where: {
            personaID: cfPersona,
            CF: cfdatore,
          },
        });

        if (existingRecord) {
          // Se il record esiste, aggiungilo all'array di aggiornamento
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
        } else {
          // Se il record non esiste, aggiungilo all'array di creazione
          recordsToCreate.push({
            id: uuid_v4(),
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
        }
      }
    }

    // Esegui le operazioni di creazione e aggiornamento in batch
    if (recordsToCreate.length > 0) {
      await prisma.datore.createMany({
        data: recordsToCreate,
      });
      console.log("Creati ", recordsToCreate.length, " datori");
    }

    if (recordsToUpdate.length > 0) {
      for (const updateData of recordsToUpdate) {
        await prisma.datore.update(updateData);
      }
      console.log("Aggiornati ", recordsToUpdate.length, " datori");
    }

    revalidatePath(`/category/lavoro`);

    console.log("Elaborazione completata con successo");
    return "OK";
  } catch (error) {
    console.error("Errore generale durante l'elaborazione: ", error);
    return "error";
  }
}

// funziona bene
// export async function updateProcessFile(data: TData[]) {
//   try {
//     console.log("Inizio elaborazione di ", data.length, " record");

//     const cfs = data.map((item) => item.CF);

//     const personeEsistenti = await prisma.persona.findMany({
//       where: {
//         CF: {
//           in: cfs,
//         },
//       },
//     });

//     const personeEsistentiMap = new Map(
//       personeEsistenti.map((persona) => [persona.CF, persona])
//     );

//     console.log("personeEsistentiMap => ", personeEsistentiMap);

//     const createData: Prisma.PersonaCreateManyInput[] = [];
//     const updateData: {
//       where: { CF: string };
//       data: Prisma.PersonaUpdateInput;
//     }[] = [];

//     for (const item of data) {
//       const newBirthDate = item.data_nascita.toString();
//       const newDieDate = item.data_morte.toString();

//       if (personeEsistentiMap.has(item.CF)) {
//         // Aggiornamento
//         const personaEsistente = personeEsistentiMap.get(item.CF);

//         if (personaEsistente) {
//           const updatedCap = personaEsistente.cap.includes(item.cap)
//             ? personaEsistente.cap
//             : [...personaEsistente.cap, item.cap];
//           const updatedComune = personaEsistente.comune.includes(item.comune)
//             ? personaEsistente.comune
//             : [...personaEsistente.comune, item.comune];
//           const updatedProvincia = personaEsistente.provincia.includes(
//             item.provincia
//           )
//             ? personaEsistente.provincia
//             : [...personaEsistente.provincia, item.provincia];
//           const updatedVia = personaEsistente.via.includes(item.via)
//             ? personaEsistente.via
//             : [...personaEsistente.via, item.via];

//           updateData.push({
//             where: { CF: item.CF },
//             data: {
//               cap: updatedCap,
//               comune: updatedComune,
//               provincia: updatedProvincia,
//               via: updatedVia,
//               cognome: item.cognome,
//               comune_nascita: item.comune_nascita,
//               data_morte: newDieDate,
//               data_nascita: newBirthDate,
//               nome: item.nome,
//               PIVA: item.PIVA,
//               provincia_nascita: item.provincia_nascita,
//               sesso: item.sesso,
//             },
//           });
//         }
//       } else {
//         console.log("item create => ", item.CF);
//         // Creazione
//         createData.push({
//           id: item.CF,
//           cap: [item.cap],
//           cognome: item.cognome,
//           comune: [item.comune],
//           comune_nascita: item.comune_nascita,
//           data_morte: newDieDate,
//           data_nascita: newBirthDate,
//           nome: item.nome,
//           PIVA: item.PIVA,
//           provincia: [item.provincia],
//           provincia_nascita: item.provincia_nascita,
//           sesso: item.sesso,
//           via: [item.via],
//           CF: item.CF,
//         });
//       }
//     }

//     // Esegui updateMany se ci sono dati da aggiornare
//     if (updateData.length > 0) {
//       for (const updateItem of updateData) {
//         await prisma.persona.update({
//           where: updateItem.where,
//           data: updateItem.data,
//         });
//       }
//       console.log("updateMany completato per ", updateData.length, " record");
//     }

//     console.log("createData => ", createData);

//     // Esegui createMany se ci sono dati da creare
//     if (createData.length > 0) {
//       await prisma.persona.createMany({
//         data: createData,
//       });
//       console.log("createMany completato per ", createData.length, " record");
//     }

//     console.log("update [0] => ", updateData.at(0));
//     console.log("update");

//     revalidatePath(`/category/anagrafica`);
//     console.log("Elaborazione completata con successo");
//     return "OK";
//   } catch (error) {
//     console.error("Errore generale durante l'elaborazione: ", error);
//     return "error";
//   }
// }

export async function importaPersone(personeInput: PersonaInput[]) {
  try {
    // Suddividi i record in blocchi da 100
    const batchSize = 100;
    const batches = [];

    // Suddividi i dati in batch
    for (let i = 0; i < personeInput.length; i += batchSize) {
      batches.push(personeInput.slice(i, i + batchSize));
    }

    // Esegui ogni batch come una transazione separata
    for (const batch of batches) {
      await prisma.$transaction(async (prisma) => {
        // Imposta il timeout delle transazioni
        await prisma.$executeRaw`SET statement_timeout = 30000;`; // Impostato a 30 secondi

        // 1. Estrai tutti i CF unici dal file Excel per il batch corrente
        const cfUnici = Array.from(new Set(batch.map((p) => p.CF)));

        // 2. Ottieni tutte le persone esistenti nel DB per il batch
        const personeEsistenti = await prisma.persona.findMany({
          where: {
            CF: { in: cfUnici },
          },
        });

        // 3. Organizza le operazioni di creazione e aggiornamento
        const personeDaCreare = [];
        const personeDaAggiornare = [];

        for (const personaInput of batch) {
          // Verifica se la persona esiste
          const personaEsistente = personeEsistenti.find(
            (p) => p.CF === personaInput.CF
          );

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
                  : [
                      ...personaEsistente?.comune,
                      personaInput.Comune.toString(),
                    ]
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
            // 4. Se la persona esiste, aggiungiamo l'operazione di aggiornamento
            personeDaAggiornare.push({
              where: { CF: personaInput.CF },
              data: personaData,
            });
          } else {
            // 5. Se la persona non esiste, la aggiungiamo all'elenco di creazione
            personeDaCreare.push(personaData);
          }
        }

        // 6. Esegui le operazioni di creazione in batch
        // if (personeDaCreare.length > 0) {
        //   await prisma.persona.createMany({ data: personeDaCreare });
        // }

        // // 7. Esegui gli aggiornamenti in batch
        // if (personeDaAggiornare.length > 0) {
        //   await Promise.all(
        //     personeDaAggiornare.map((updateData) =>
        //       prisma.persona.update({
        //         where: updateData.where,
        //         data: updateData.data,
        //       })
        //     )
        //   );
        // }

        // await personaQueue.add("processaPersona", {
        //   personeDaCreare,
        //   personeDaAggiornare,
        // });

        // console.log("persone da creare => ", personeDaCreare.length);
        // console.log(
        //   "persona da creare 0=> ",
        //   JSON.stringify(personeDaCreare.at(1))
        // );
        // console.log("persone da agg => ", personeDaAggiornare.length);

        const response = await fetch(
          "https://worker-gestionale-recupero-crediti.onrender.com/add-job",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ personeDaCreare, personeDaAggiornare }),
          }
        );

        if (!response.ok) throw new Error("Errore durante l'aggiunta del job");
        return "OK";
      });
    }

    return "OK";
  } catch (error) {
    console.error("Errore durante l'importazione delle persone:", error);
    return "errore";
  }
}

export async function importaTelefoni(personeInput: TelefonoInput[]) {
  try {
    const batchSize = 300; // Per evitare timeout
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

        // 6️⃣ Eseguiamo le operazioni batch nel DB
        if (telefoniDaCreare.length > 0) {
          await prisma.telefono.createMany({ data: telefoniDaCreare });
        }

        if (telefoniDaAggiornare.length > 0) {
          await Promise.all(
            telefoniDaAggiornare.map((telefono) =>
              prisma.telefono.update({
                where: { id: telefono.id },
                data: { value: telefono.value },
              })
            )
          );
        }

        if (telefoniDaEliminare.length > 0) {
          await prisma.telefono.deleteMany({
            where: { id: { in: telefoniDaEliminare } },
          });
        }
      });
    }

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

export async function updateProcessFileSCP(
  data: { CF: string; C: string; SC: string; P: string; SP: string }[]
) {
  try {
    console.log("Inizio elaborazione SCP per ", data.length, " persone");

    const results = await Promise.all(
      data.map(async (item) => {
        try {
          const idPersona = await prisma.persona.findFirst({
            where: {
              CF: item.CF,
            },
            select: {
              id: true,
            },
          });

          await prisma.cessionePignoramento.upsert({
            where: {
              id: item.CF,
            },
            create: {
              id: item.CF,
              cessione: item.C.toString(),
              pignoramento: item.P.toString(),
              scadenza_cessione: item.SC.toString(),
              scadenza_pignoramento: item.SP.toString(),
              personaID: idPersona?.id ?? "",
            },
            update: {
              cessione: item.C.toString(),
              pignoramento: item.P.toString(),
              scadenza_cessione: item.SC.toString(),
              scadenza_pignoramento: item.SP.toString(),
              personaID: idPersona?.id ?? "",
            },
          });
          console.log("SCP aggiornato per CF: ", item.CF);
          return { success: true };
        } catch (innerError) {
          console.error(
            "Errore durante l'aggiornamento SCP per CF: ",
            item.CF,
            innerError
          );
          return { success: false, error: innerError };
        }
      })
    );

    const hasErrors = results.some((result) => !result.success);

    if (hasErrors) {
      console.error("Elaborazione SCP completata con errori");
      return "error";
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

    const results = await Promise.all(
      data.map(async (item) => {
        try {
          const datore = await prisma.datore.findFirst({
            where: {
              CF: item.CF,
            },
          });

          console.log("datore ID =>", datore?.id);

          const persona = datore
            ? null
            : await prisma.persona.findFirst({
                where: {
                  CF: item.CF,
                },
              });

          console.log("persona ID =>", persona?.id);
          console.log(
            "ABICAB datore ID =>",
            datore?.id
              ? datore.id
              : persona?.id ?? "34ca4cb7-4088-4cef-b7f5-3e448f7c8c77"
          );

          await prisma.abiCab.upsert({
            where: {
              id: item.CF,
            },
            update: {
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
              datoreID: datore?.id,
              personaID: persona?.id,
            },
            create: {
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
              datoreID: datore?.id,
              personaID: persona?.id,
              id: item.CF,
            },
          });
          console.log("ABICAB aggiornato per CF: ", item.CF);
          return { success: true };
        } catch (innerError) {
          console.error(
            "Errore durante l'aggiornamento ABICAB per CF: ",
            item.CF,
            innerError
          );
          return { success: false, error: innerError };
        }
      })
    );

    const hasErrors = results.some((result) => !result.success);

    if (hasErrors) {
      console.error("Elaborazione ABICAB completata con errori");
      return "error";
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

    const recordsToCreate = [];

    for (const item of data) {
      // Verifica se il record esiste già
      const existingRecord = await prisma.contoCorrente.findFirst({
        where: {
          CF: item.CF,
          banca: item.banca,
        },
      });

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

    if (recordsToCreate.length > 0) {
      await prisma.contoCorrente.createMany({
        data: recordsToCreate,
      });
      console.log("Creati ", recordsToCreate.length, " conti correnti");
    } else {
      console.log("Nessun conto corrente da creare.");
    }

    revalidatePath("/category/cc");

    console.log("Upload conti correnti completato con successo");
    return "OK";
  } catch (error) {
    console.error("Errore durante l'upload dei conti correnti: ", error);
    return "error";
  }
}
