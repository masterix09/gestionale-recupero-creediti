import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await request.json();
    const { category, cf } = body;

    if (!category || !cf) {
      return NextResponse.json(
        { error: "Categoria e codice fiscale sono richiesti" },
        { status: 400 }
      );
    }

    const categoryNames: { [key: string]: string } = {
      anagrafica: "Anagrafica",
      lavoro: "Lavoro",
      telefono: "Telefono",
      scp: "SCP (Cessione/Pignoramento)",
      cc: "Conto Corrente",
      abicab: "ABI CAB",
    };

    const categoryName = categoryNames[category] || category;

    // Invia email con Gmail
    const emailResult = await sendEmail({
      to: "recuperoinfoitaliae@gmail.com", // Cambia con la tua email
      subject: `Richiesta dati ${categoryName} - ${cf}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nuova Richiesta Dati</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #666; margin-top: 0;">Dettagli Richiesta</h3>
            <p><strong>Utente:</strong> ${session.user.email}</p>
            <p><strong>Nome:</strong> ${
              session.user.name || "Non specificato"
            }</p>
            <p><strong>Categoria:</strong> ${categoryName}</p>
            <p><strong>Codice Fiscale:</strong> ${cf}</p>
            <p><strong>Data Richiesta:</strong> ${new Date().toLocaleString(
              "it-IT"
            )}</p>
          </div>
          
          <p style="color: #666;">
            L'utente ha richiesto dati per la categoria <strong>${categoryName}</strong> 
            per il codice fiscale <strong>${cf}</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Questa email è stata generata automaticamente dal sistema di gestione recupero crediti.
          </p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("Errore invio email:", emailResult.error);
      return NextResponse.json(
        { error: "Errore nell'invio della richiesta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Richiesta inviata con successo",
      emailId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Errore nella richiesta dati:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
