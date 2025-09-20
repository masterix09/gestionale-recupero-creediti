"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { useParams } from "next/navigation";

interface NoDataMessageProps {
  category: string;
}

export default function NoDataMessage({ category }: NoDataMessageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const params = useParams();
  const cf = params.id as string;

  const categoryNames: { [key: string]: string } = {
    anagrafica: "Anagrafica",
    lavoro: "Lavoro",
    telefono: "Telefono",
    scp: "SCP (Cessione/Pignoramento)",
    cc: "Conto Corrente",
    abicab: "ABI CAB",
  };

  const categoryName = categoryNames[category] || category;

  const handleRequestData = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/request-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          cf,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Richiesta inviata con successo! Riceverai una risposta via email."
        );
      } else {
        setMessage(data.error || "Errore nell'invio della richiesta.");
      }
    } catch (error) {
      setMessage("Errore di connessione. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p className="text-center mb-4">
        Nessun dato {categoryName} disponibile per questo codice fiscale.
      </p>

      <div className="text-center">
        <Button
          onClick={handleRequestData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invio in corso...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Richiedi Dati
            </>
          )}
        </Button>
      </div>

      {message && (
        <div
          className={`mt-3 p-2 rounded text-sm text-center ${
            message.includes("successo")
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
