"use client";

import { z } from "zod";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createUser } from "@/actions/creatUseractions";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "email non valida" }),
  password: z.string().min(2, { message: "Lunghezza minima 2 caratteri" }),
  packageType: z.enum(["basic", "premium", "gold"], {
    required_error: "Seleziona una tipologia di pacchetto",
  }),
});

export default function Page() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      packageType: "basic",
      password: "",
    },
  });

  const { toast } = useToast();

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    const result = await createUser(values);

    if (result === "OK") {
      toast({
        title: "Utente creato!",
        description: "Nuovo utente creato con successo",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Ops ! Errore!",
        description: "Errore nella creazione utente. Riprova!",
      });
    }
  }
  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="w-full md:w-[80%] lg:w-[60%] px-3 md:px-0 lg:px-0">
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Pass123@" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="packageType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-white">
                    Scegli il pacchetto
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 ">
                        <FormControl>
                          <RadioGroupItem
                            value="basic"
                            className="border-white text-red-500"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-white">
                          Basic Plan
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="premium"
                            className="border-white text-red-500"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-white">
                          Premium Plan
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="gold"
                            className="border-white text-red-500"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-white">
                          Gold Plan
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
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
