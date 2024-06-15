"use server"

import prisma from "@/lib/db"

export const getAnagrafica = async (id: string) => {

    return await prisma.persona.findFirst({
        where: {
            id
        },
    })
}

export const getLavoro = async (id: string) => {

    return await prisma.datore.findMany({
        where: {
            personaID: id
        },
    })
}

export const getSCP = async (id: string) => {

    return await prisma.cessionePignoramento.findFirst({
        where: {
            personaID: id
        },
    })
}

export const getTelefono = async (id: string) => {

    return await prisma.telefono.findMany({
        where: {
            personaID: id
        },
    })
}