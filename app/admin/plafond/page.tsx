"use client";
import { addToken } from "@/actions/fetchDatabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "email non valida" }),
  plafond: z.number().min(10, "Minimo di token assegnabili 10"),
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      plafond: 10,
    },
  });

  const { toast } = useToast();

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    const result = await addToken(values);

    if (result === "OK") {
      toast({
        title: "Plafond Aggiornato!",
        description: "Nuovo plafond settato con successo",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Ops ! Errore!",
        description: "Errore nel settaggio del plafond. Riprova!",
      });
    }
  }
  return (
    <div className="h-full w-full">
      <h3 className="text-white text-xl font-semibold my-4">
        Gestione plafond
      </h3>
      <div className="w-full max-lg:px-3 lg:w-1/2 lg:mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="prova@prova.it" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plafond"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Token</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="100"
                      type="number"
                      min={10}
                      {...field}
                      onChange={(event) => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="border-2 border-white rounded-lg w-[250px] max-w-lg bg-red-800"
            >
              CREA UTENTE
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
