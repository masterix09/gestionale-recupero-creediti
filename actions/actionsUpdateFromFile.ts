"use server";

import prisma from "@/lib/db";
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

    const results = await Promise.all(
      data.flatMap((persona) =>
        persona.datore.map(async (datore) => {
          try {
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

            await prisma.datore.create({
              data: {
                id: uuid_v4(),
                cap: cap.toString() ?? "",
                CF: cfdatore ?? "",
                comune,
                fine,
                inizio,
                mese: mese?.toString() ?? "",
                nome,
                PIVA: piva,
                provincia,
                ragione_sociale: ragioneSociale,
                reddito: reddito?.toString() ?? "",
                tipo,
                tipologia_contratto: partTime,
                via,
                personaID: cfPersona ?? "",
              },
            });

            console.log("Datore creato per persona con CF: ", persona.CF);
            return { success: true };
          } catch (innerError) {
            console.error(
              "Errore durante la creazione del datore per persona con CF: ",
              persona.CF,
              innerError
            );
            return { success: false, error: innerError };
          }
        })
      )
    );

    const hasErrors = results.some((result) => !result.success);

    if (hasErrors) {
      console.error("Elaborazione completata con errori");
      return "error";
    }

    console.log("Elaborazione completata con successo");
    return "OK";
  } catch (error) {
    console.error("Errore generale durante l'elaborazione: ", error);
    return "error";
  }
}

export async function updateProcessFile(data: TData[]) {
  try {
    console.log("Inizio elaborazione di ", data.length, " record");

    const results = await Promise.all(
      data.map(async (item) => {
        try {
          const newBirthDate = item.data_nascita.slice(
            1,
            item.data_nascita.length
          );

          const persona = await prisma.persona.findFirst({
            where: {
              CF: item.CF,
            },
          });

          await prisma.persona.upsert({
            where: {
              CF: item.CF,
            },
            create: {
              id: item.CF,
              cap: [item.cap.toString()],
              cognome: item.cognome,
              comune: [item.comune],
              comune_nascita: item.comune_nascita,
              data_morte: item.data_morte,
              data_nascita: newBirthDate.toString(),
              nome: item.nome,
              PIVA: item.PIVA,
              provincia: [item.provincia],
              provincia_nascita: item.provincia_nascita,
              sesso: item.sesso,
              via: [item.via],
              CF: item.CF,
            },
            update: {
              cap: persona?.cap.includes(item.cap.toString())
                ? persona.cap
                : [...(persona?.cap || []), item.cap.toString()],
              cognome: item.cognome,
              comune: persona?.comune.includes(item.comune.toString())
                ? persona.comune
                : [...(persona?.comune || []), item.comune.toString()],
              comune_nascita: item.comune_nascita,
              data_morte: item.data_morte,
              data_nascita: newBirthDate.toString(),
              nome: item.nome,
              PIVA: item.PIVA,
              provincia: persona?.provincia.includes(item.provincia.toString())
                ? persona.provincia
                : [...(persona?.provincia || []), item.provincia.toString()],
              provincia_nascita: item.provincia_nascita,
              sesso: item.sesso,
              via: persona?.via.includes(item.via.toString())
                ? persona.via
                : [...(persona?.via || []), item.via.toString()],
            },
          });

          console.log("Upsert completato per CF: ", item.CF);
          return { success: true };
        } catch (innerError) {
          console.error(
            "Errore durante l'elaborazione del record con CF: ",
            item.CF,
            innerError
          );
          return { success: false, error: innerError };
        }
      })
    );

    const hasErrors = results.some((result) => !result.success);

    if (hasErrors) {
      console.error("Elaborazione completata con errori");
      return "error";
    }

    console.log("Elaborazione completata con successo");
    return "OK";
  } catch (error) {
    console.error("Errore generale durante l'elaborazione: ", error);
    return "error";
  }
}

// export async function updateProcessFile(data: TData[]) {
//   try {

//     console.log(data);

//     data.forEach(async (item) => {
//       console.log("ci sono dentro al for");
//       console.log("item ", item);

//       const newBirthDate = item.data_nascita.slice(
//         1,
//         item.data_nascita.length - 1
//       );
//       // console.log(newBirthDate);

//       const persona = await prisma.persona.findFirst({
//         where: {
//           CF: item.CF,
//         },
//       });

//       console.log("persona find => ", persona)

//       console.log("CF => ", item.CF)

//       await prisma.persona.upsert({
//         where: {
//           CF: item.CF,
//         },
//         create: {
//           id: item.CF,
//           cap: [item.cap.toString()],
//           cognome: item.cognome,
//           comune: [item.comune],
//           comune_nascita: item.comune_nascita,
//           data_morte: item.data_morte,
//           data_nascita: newBirthDate.toString(),
//           nome: item.nome,
//           PIVA: item.PIVA,
//           provincia: [item.provincia],
//           provincia_nascita: item.provincia_nascita,
//           sesso: item.sesso,
//           via: [item.via],
//           CF: item.CF,
//         },
//         update: {
//           cap:
//             persona?.cap.at(persona.cap.length - 1) !== item.cap.toString()
//               ? persona?.cap.concat(item.cap.toString())
//               : [...persona.cap],
//           cognome: item.cognome,
//           comune:
//             persona?.comune.at(persona.comune.length - 1) !==
//             item.comune.toString()
//               ? persona?.comune.concat(item.comune.toString())
//               : [...persona.comune],
//           comune_nascita: item.comune_nascita,
//           data_morte: item.data_morte,
//           data_nascita: item.data_nascita,
//           nome: item.nome,
//           PIVA: item.PIVA,
//           provincia:
//             persona?.provincia.at(persona.provincia.length - 1) !==
//             item.provincia.toString()
//               ? persona?.provincia.concat(item.provincia.toString())
//               : [...persona.provincia],
//           provincia_nascita: item.provincia_nascita,
//           sesso: item.sesso,
//           via:
//             persona?.via.at(persona.via.length - 1) !== item.via.toString()
//               ? persona?.via.concat(item.via.toString())
//               : [...persona.via],
//         },
//       });
//     });

//     //    addDataToDatore(data)

//     console.log("finito")

//     return "OK";
//   } catch (error) {
//     console.log("errror", error);

//     return "error";
//   }
// }

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

          const persona = datore
            ? null
            : await prisma.persona.findFirst({
                where: {
                  CF: item.CF,
                },
              });

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
              datoreID:
                datore?.id ??
                persona?.id ??
                "34ca4cb7-4088-4cef-b7f5-3e448f7c8c77",
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
              datoreID:
                datore?.id ??
                persona?.id ??
                "34ca4cb7-4088-4cef-b7f5-3e448f7c8c77",
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

    const dataUpload: {
      banca: string;
      CF: string;
      id: string;
      nome: string;
    }[] = data.map((item) => ({
      banca: item.banca,
      CF: item.CF,
      nome: item.nome,
      id: uuid_v4(),
    }));

    await prisma.contoCorrente.createMany({
      data: dataUpload,
    });

    console.log("Upload conti correnti completato con successo");
    return "OK";
  } catch (error) {
    console.error("Errore durante l'upload dei conti correnti: ", error);
    return "error";
  }
}
