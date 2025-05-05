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
import { modifyUser } from "@/actions/creatUseractions";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "email non valida" }),
  packageType: z.enum(["basic", "premium", "gold"], {
    required_error: "Seleziona una tipologia di pacchetto",
  }),
  token: z.number().min(10, "Minimo di token assegnabili 10"),
});

enum EPackageType {
  basic = "basic",
  premium = "premium",
  gold = "gold",
}
const FormUpdateUser = ({
  data,
  id,
}: {
  data: {
    email: string;
    role: string;
    packageType: string;
    token: number;
    disable: boolean;
  } | null;
  id: string;
}) => {
  const [disableUser, setDisableUser] = useState<boolean>(
    data?.disable ?? false
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: data?.email,
      packageType: data?.packageType as EPackageType,
      token: data?.token,
    },
  });

  const { toast } = useToast();

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    const result = await modifyUser({ ...values, id, disableUser });

    if (result === "OK") {
      toast({
        title: "Utente modificato!",
        description: "Utente modificato con successo",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Ops ! Errore!",
        description: "Errore nella modifica utente. Riprova!",
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
                    <Input placeholder="prova@prova.it" {...field} disabled />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="disableUser"
                className="border-white data-[state=checked]:!bg-white data-[state=checked]:!text-red-500"
                checked={disableUser}
                onCheckedChange={() => setDisableUser(!disableUser)}
              />
              <label
                htmlFor="disableUser"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
              >
                Disabilita Utente
              </label>
            </div>

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
            <FormField
              control={form.control}
              name="token"
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
              MODIFICA UTENTE
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default FormUpdateUser;
