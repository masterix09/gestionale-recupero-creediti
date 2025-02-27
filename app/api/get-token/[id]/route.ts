import { getTokenById } from "@/actions/fetchDatabase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const tokens = await getTokenById(userId); // Funzione che recupera i token dal DB
  return NextResponse.json({ tokens });
}
