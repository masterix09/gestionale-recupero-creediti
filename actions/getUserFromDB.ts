"use server"

export default async function checkUser( email: string, password: string) {
    if(email === "amministrazione@admin.it" && password === "admin1234" ) {

        const user = {
            id: "1",
            name: "Admin",
            email: "amministrazione@admin.it",
            role: "admin"
        }
        return user
    } else return {
        id: "2",
        name: "prova",
        email: email,
        role: "user"
    }
}