import { personaQueue } from "@/lib/queue";
import { NextResponse } from "next/server";

export async function GET() {
  const jobsInCoda = await personaQueue.getWaitingCount();
  const jobsAttivi = await personaQueue.getActiveCount();
  const jobsCompletati = await personaQueue.getCompletedCount();

  return NextResponse.json({
    waiting: jobsInCoda,
    active: jobsAttivi,
    completed: jobsCompletati,
  });
}
