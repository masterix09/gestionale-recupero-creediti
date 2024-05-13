"use client";
import React from "react";
import { Button } from "../ui/button";
import { useFormStatus } from "react-dom";

const ButtonLoading = ({ title }: { title: string }) => {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      className="rounded-xl py-3 w-[80%] mx-auto bg-red-800 text-white font-semibold uppercase text-xl"
    >
      {title}
    </Button>
  );
};

export default ButtonLoading;
