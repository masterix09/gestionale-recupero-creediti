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
};

export async function updateProcessFile(data: TData[]) {

    console.log(data)

   data.forEach(async (item) => {
    await prisma.persona.upsert({
        where: {
            CF: item.CF,
        },
        create: {
            id: uuid().toString(),
            cap: item.cap,
            cognome: item.cognome,
            comune: item.comune,
            comune_nascita: item.comune_nascita,
            data_morte: item.data_morte,
            data_nascita: item.data_nascita,
            nome: item.nome,
            PIVA: item.PIVA,
            provincia: item.provincia,
            provincia_nascita: item.provincia_nascita,
            sesso: item.sesso,
            via: item.via,
            CF: item.CF
        },
        update: {
            cap: item.cap,
            cognome: item.cognome,
            comune: item.comune,
            comune_nascita: item.comune_nascita,
            data_morte: item.data_morte,
            data_nascita: item.data_nascita,
            nome: item.nome,
            PIVA: item.PIVA,
            provincia: item.provincia,
            provincia_nascita: item.provincia_nascita,
            sesso: item.sesso,
            via: item.via
        }
    })
   });
    
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
        item.Tel.map(async element => {
            element !== "" && await prisma.telefono.upsert({
                where: {
                    id: `${item.CF}${element}`,
                },
                create: {
                    id: `${item.CF}${element}`,
                    value: element.toString(),
                    personaID: idPersona?.id ?? ""
                },
                update: {

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