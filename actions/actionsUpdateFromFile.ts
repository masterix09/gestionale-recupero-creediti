"use server";

import prisma from "@/lib/db";
import { uuid } from 'uuidv4';

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
    tipo: string,
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
    provincia: string
  }[]
};


export async function addDataToDatore(data: TData[]) {
    data.forEach(persona => {
        persona.datore.forEach(async datore => {
            const { cap, comune, fine, inizio, mese, nome, partTime, piva, provincia, ragioneSociale,reddito, tipo, via, cfPersona, cfdatore} = datore;
            console.log("cfPersona => ", cfPersona)
            await prisma.datore.create({
                data: {
                    id: uuid().toString(),
                    cap,
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
                }
            })
        })
       })
}

export async function updateProcessFile(data: TData[]) {

    
    
   data.forEach(async (item) => {

    const newBirthDate = item.data_nascita.slice(1, item.data_nascita.length -1);
    console.log(newBirthDate)

    const persona = await prisma.persona.findFirst({
        where: {
            CF: item.CF
        },

    })

    await prisma.persona.upsert({
        where: {
            CF: item.CF,
        },
        create: {
            id: item.CF,
            cap: [item.cap.toString()],
            cognome: item.cognome,
            comune:  [item.comune],
            comune_nascita: item.comune_nascita,
            data_morte: item.data_morte,
            data_nascita: newBirthDate.toString(),
            nome: item.nome,
            PIVA: item.PIVA,
            provincia: [item.provincia],
            provincia_nascita: item.provincia_nascita,
            sesso: item.sesso,
            via: [item.via],
            CF: item.CF
        },
        update: {
            cap: persona?.cap.at(persona.cap.length -1) !== item.cap.toString() ? persona?.cap.concat(item.cap.toString()) : [...persona.cap],
            cognome: item.cognome,
            comune: persona?.comune.at(persona.comune.length -1) !== item.comune.toString() ? persona?.comune.concat(item.comune.toString()) : [...persona.comune],
            comune_nascita: item.comune_nascita,
            data_morte: item.data_morte,
            data_nascita: item.data_nascita,
            nome: item.nome,
            PIVA: item.PIVA,
            provincia: persona?.provincia.at(persona.provincia.length -1) !== item.provincia.toString() ? persona?.provincia.concat(item.provincia.toString()) : [...persona.provincia],
            provincia_nascita: item.provincia_nascita,
            sesso: item.sesso,
            via: persona?.via.at(persona.via.length -1) !== item.via.toString() ? persona?.via.concat(item.via.toString()) : [...persona.via],
        }
    })
   });

//    addDataToDatore(data)
    
}


export async function updateProcessFileTelefono (data: {CF: string; Tel: string[]}[]) {

    console.log(data)
  
        
    data.map(async item => {
        const idPersona = await prisma.persona.findFirst({
            where: {
                CF: item.CF
            },
            select: {
                id: true
            }
        })

        console.log(idPersona)
        item.Tel.map(async (element, idx) => {
            element !== "" && await prisma.telefono.upsert({
                where: {
                    id: `${item.CF}${idx}`,
                },
                create: {
                    id: `${item.CF}${idx}`,
                    value: element.toString(),
                    personaID: idPersona?.id ?? ""
                },
                update: {
                    id: `${item.CF}${idx}`,
                    value: element.toString(),
                    personaID: idPersona?.id ?? ""
                }
            })
        })
    })

    
}


export async function updateProcessFileSCP(data: {CF: string; C: string; SC: string; P: string; SP: string}[]) {

    data.forEach(async item => {
        const idPersona = await prisma.persona.findFirst({
            where: {
                CF: item.CF
            },
            select: {
                id: true
            }
        })
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
            personaID: idPersona?.id ?? ""
         }
     })
    });
     
 }