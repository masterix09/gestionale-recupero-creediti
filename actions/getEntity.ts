"use server"

export async function useGetEntity(prevState: any, formData: FormData) {
    console.log(formData.get("text"));
    return [{
        id: "1",
        nome: "Andrea",
        cognome: "Verde",
        telefono: "3336366381",
        codice_fiscale: "VRDNDR99R06F839Q",
        partita_iva: ""
    }]
}