"use client";

import { useState } from "react";

export default function EmailExample() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject,
          html: `<p>${message}</p>`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Email inviata con successo!");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        alert(`Errore: ${data.error}`);
      }
    } catch (error) {
      alert("Errore durante l'invio dell'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendEmail} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email destinatario:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium">
          Oggetto:
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Messaggio:
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Invio in corso..." : "Invia Email"}
      </button>
    </form>
  );
}
