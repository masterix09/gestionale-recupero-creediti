"use client";

import { RiMoneyEuroCircleFill } from "@react-icons/all-files/ri/RiMoneyEuroCircleFill";
import { Session } from "next-auth";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

const fetchTokens = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Errore nel recupero dei token");
  return res.json();
};

const ViewToken = ({ sessions }: { sessions: Session | null }) => {
  const { data, error } = useSWR(
    sessions?.user.id ? `/api/get-token/${sessions?.user.id}` : null,
    fetchTokens,
    {
      refreshInterval: 5000, // Aggiorna ogni 5s
    }
  );
  if (error) return <div>Errore nel caricamento</div>;
  if (!data) return <div>Caricamento...</div>;
  return (
    <div className="flex gap-x-3">
      <RiMoneyEuroCircleFill className="w-6 h-6 text-white" />
      <span className="text-white font-bold">{data.tokens.token}</span>
    </div>
  );
};

export default ViewToken;
