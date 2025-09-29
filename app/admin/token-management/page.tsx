"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, RefreshCw } from "lucide-react";

interface CategoryToken {
  id: string;
  category: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { key: "anagrafica", label: "Anagrafica" },
  { key: "lavoro", label: "Lavoro" },
  { key: "telefono", label: "Telefono" },
  { key: "scp", label: "SCP (Cessione/Pignoramento)" },
  { key: "cc", label: "Conto Corrente" },
  { key: "abicab", label: "ABI CAB" },
];

export default function TokenManagementPage() {
  const [tokens, setTokens] = useState<CategoryToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokenValues, setTokenValues] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  // Carica i token esistenti
  const loadTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/token-management");
      if (response.ok) {
        const data = await response.json();
        setTokens(data);

        // Inizializza i valori per il form
        const initialValues: { [key: string]: number } = {};
        data.forEach((token: CategoryToken) => {
          initialValues[token.category] = token.tokens;
        });
        setTokenValues(initialValues);
      } else {
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei token",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  // Salva i token modificati
  const saveTokens = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/token-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tokenValues),
      });

      if (response.ok) {
        toast({
          title: "Successo",
          description: "Token salvati con successo",
        });
        await loadTokens(); // Ricarica i dati
      } else {
        toast({
          title: "Errore",
          description: "Errore nel salvataggio dei token",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel salvataggio dei token",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Inizializza i token se non esistono
  const initializeTokens = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/token-management/initialize", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Successo",
          description: "Token inizializzati con i valori predefiniti",
        });
        await loadTokens();
      } else {
        toast({
          title: "Errore",
          description: "Errore nell'inizializzazione dei token",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'inizializzazione dei token",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Gestione Token per Categoria
        </h1>
        <p className="text-gray-600 mt-2">
          Configura il numero di token da scalare per ogni categoria di ricerca
        </p>
      </div>

      {tokens.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Inizializza Token</CardTitle>
            <CardDescription>
              I token per le categorie non sono ancora stati configurati. Clicca
              il pulsante qui sotto per inizializzarli con i valori predefiniti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={initializeTokens} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Inizializza Token
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Configurazione Token
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadTokens} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Ricarica
              </Button>
              <Button onClick={saveTokens} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salva Modifiche
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {CATEGORIES.map((category) => (
              <Card key={category.key}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.label}</CardTitle>
                  <CardDescription>
                    Numero di token da scalare per ricerche in questa categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label htmlFor={`token-${category.key}`}>
                        Token per ricerca
                      </Label>
                      <Input
                        id={`token-${category.key}`}
                        type="number"
                        min="1"
                        value={tokenValues[category.key] || 0}
                        onChange={(e) =>
                          setTokenValues({
                            ...tokenValues,
                            [category.key]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      Attuale:{" "}
                      {tokens.find((t) => t.category === category.key)
                        ?.tokens || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
