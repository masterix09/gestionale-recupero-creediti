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

// export async function updateProcessFile(data: TData[]) {
//   try {
//     console.log("Inizio elaborazione di ", data.length, " record");

//     const results = await Promise.all(
//       data.map(async (item) => {
//         try {
//           const newBirthDate = item.data_nascita
//             .toString()
//             .slice(0, item.data_nascita.length);
//           const newDieDate = item.data_morte
//             .toString()
//             .slice(0, item.data_morte.length);

//           const persona = await prisma.persona.findFirst({
//             where: {
//               CF: item.CF,
//             },
//           });

//           await prisma.persona.upsert({
//             where: {
//               CF: item.CF,
//             },
//             create: {
//               id: item.CF.toString(),
//               cap: [item.cap.toString()],
//               cognome: item.cognome,
//               comune: [item.comune],
//               comune_nascita: item.comune_nascita,
//               data_morte: newDieDate.toString(),
//               data_nascita: newBirthDate.toString(),
//               nome: item.nome.toString(),
//               PIVA: item.PIVA.toString(),
//               provincia: [item.provincia],
//               provincia_nascita: item.provincia_nascita,
//               sesso: item.sesso,
//               via: [item.via],
//               CF: item.CF.toString(),
//             },
//             update: {
//               cap: persona?.cap.includes(item.cap.toString())
//                 ? persona.cap
//                 : [...(persona?.cap || []), item.cap.toString()],
//               cognome: item.cognome,
//               comune: persona?.comune.includes(item.comune.toString())
//                 ? persona.comune
//                 : [...(persona?.comune || []), item.comune.toString()],
//               comune_nascita: item.comune_nascita,
//               data_morte: newDieDate.toString(),
//               data_nascita: newBirthDate.toString(),
//               nome: item.nome,
//               PIVA: item.PIVA.toString(),
//               provincia: persona?.provincia.includes(item.provincia.toString())
//                 ? persona.provincia
//                 : [...(persona?.provincia || []), item.provincia.toString()],
//               provincia_nascita: item.provincia_nascita,
//               sesso: item.sesso,
//               via: persona?.via.includes(item.via.toString())
//                 ? persona.via
//                 : [...(persona?.via || []), item.via.toString()],
//             },
//           });

//           console.log("Upsert completato per CF: ", item.CF);
//           return { success: true };
//         } catch (innerError) {
//           console.error(
//             "Errore durante l'elaborazione del record con CF: ",
//             item.CF,
//             innerError
//           );
//           return { success: false, error: innerError };
//         }
//       })
//     );

//     const hasErrors = results.some((result) => !result.success);

//     if (hasErrors) {
//       console.error("Elaborazione completata con errori");
//       return "error";
//     }

//     revalidatePath(`/category/anagrafica`);
//     console.log("Elaborazione completata con successo");
//     return "OK";
//   } catch (error) {
//     console.error("Errore generale durante l'elaborazione: ", error);
//     return "error";
//   }
// }

export async function updateProcessFile(data: TData[]) {
  try {
    console.log("Inizio elaborazione di ", data.length, " record");

    // Ottieni tutti i CF dai dati in input
    const cfs = data.map((item) => item.CF);

    // Esegui una query batch per recuperare tutte le persone esistenti
    const personeEsistenti = await prisma.persona.findMany({
      where: {
        CF: {
          in: cfs,
        },
      },
    });

    // Crea una mappa di controllo per le persone esistenti
    const personeEsistentiMap = new Map(
      personeEsistenti.map((persona) => [persona.CF, persona])
    );

    const createData: Prisma.PersonaCreateManyInput[] = [];
    const updateData: Prisma.PersonaUpdateArgs[] = [];

    for (const item of data) {
      const newBirthDate = item.data_nascita.toString();
      const newDieDate = item.data_morte.toString();

      if (personeEsistentiMap.has(item.CF)) {
        // Aggiornamento
        updateData.push({
          where: { CF: item.CF },
          data: {
            cap: { push: item.cap },
            comune: { push: item.comune },
            provincia: { push: item.provincia },
            via: { push: item.via },
            cognome: item.cognome,
            comune_nascita: item.comune_nascita,
            data_morte: newDieDate,
            data_nascita: newBirthDate,
            nome: item.nome,
            PIVA: item.PIVA,
            provincia_nascita: item.provincia_nascita,
            sesso: item.sesso,
          },
        });
      } else {
        // Creazione
        createData.push({
          id: item.CF,
          cap: [item.cap],
          cognome: item.cognome,
          comune: [item.comune],
          comune_nascita: item.comune_nascita,
          data_morte: newDieDate,
          data_nascita: newBirthDate,
          nome: item.nome,
          PIVA: item.PIVA,
          provincia: [item.provincia],
          provincia_nascita: item.provincia_nascita,
          sesso: item.sesso,
          via: [item.via],
          CF: item.CF,
        });
      }
    }

    // Esegui updateMany se ci sono dati da aggiornare
    if (updateData.length > 0) {
      await prisma.persona.updateMany({
        data: updateData.map((update) => update.data),
        where: {
          OR: updateData.map((update) => ({ CF: update.where.CF })),
        },
      });
      console.log("updateMany completato per ", updateData.length, " record");
    }

    // Esegui createMany se ci sono dati da creare
    if (createData.length > 0) {
      await prisma.persona.createMany({
        data: createData,
      });
      console.log("createMany completato per ", createData.length, " record");
    }

    revalidatePath(`/category/anagrafica`);
    console.log("Elaborazione completata con successo");
    return "OK";
  } catch (error) {
    console.error("Errore generale durante l'elaborazione: ", error);
    return "error";
  }
}

export async function updateProcessFileTelefono(
  data: { CF: string; Tel: string[] }[]
) {
  try {
    console.log("Inizio elaborazione telefoni per ", data.length, " persone");

    const results = await Promise.all(
      data.flatMap((item) => {
        return item.Tel.map(async (element) => {
          try {
            if (element !== "") {
              const idPersona = await prisma.persona.findFirst({
                where: {
                  CF: item.CF,
                },
                select: {
                  id: true,
                },
              });

              await prisma.telefono.upsert({
                where: {
                  id: element.toString(),
                },
                create: {
                  id: element.toString(),
                  value: element.toString(),
                  personaID: idPersona?.id ?? "",
                },
                update: {
                  id: element.toString(),
                  value: element.toString(),
                  personaID: idPersona?.id ?? "",
                },
              });
              console.log(
                "Telefono aggiornato per CF: ",
                item.CF,
                ", Tel: ",
                element
              );
              return { success: true };
            }
            return { success: true }; // Se element è vuoto, considera come successo
          } catch (innerError) {
            console.error(
              "Errore durante l'aggiornamento del telefono per CF: ",
              item.CF,
              ", Tel: ",
              element,
              innerError
            );
            return { success: false, error: innerError };
          }
        });
      })
    );

    const hasErrors = results.some((result) => !result.success);

    if (hasErrors) {
      console.error("Elaborazione telefoni completata con errori");
      return "error";
    }

    revalidatePath("/category/telefono");
    console.log("Elaborazione telefoni completata con successo");
    return "OK";
  } catch (error) {
    console.error(
      "Errore generale durante l'elaborazione dei telefoni: ",
      error
    );
    return "error";
  }
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
