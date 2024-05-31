"use server"

import prisma from "@/lib/db";
import { v4 } from 'uuid';


export async function createUser(data: {email: string; password: string; packageType: string}) {

    const {email, packageType, password} = data

    try {

        await prisma.user.create({
            data: {
                id: v4(),
                email,
                packageType,
                password,
                role: "user"
            }
        })

        return "OK"
        
    } catch (error: any) {
        return error.toString()
    }
    
    
}