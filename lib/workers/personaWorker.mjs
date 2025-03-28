import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "../db2.mjs";
import { personaQueue } from "../queue.mjs";
import { redisConnection } from "../redis.mjs";

// Crea il worker per processare i job della coda "personaQueue"
const personaWorker = new Worker(
  "personaQueue",
  async (job) => {
    console.log(`✅ Elaborando job ID: ${job.id}`);
    const { personeDaCreare, personeDaAggiornare } = job.data;

    // 1️⃣ Creazione di nuove persone
    if (personeDaCreare.length > 0) {
      await prisma.persona.createMany({
        data: personeDaCreare,
        skipDuplicates: true, // Evita duplicati
      });
    }

    // 2️⃣ Aggiornamento persone esistenti
    for (const persona of personeDaAggiornare) {
      await prisma.persona.update({
        where: { id: persona.id },
        data: persona.data,
      });
    }

    console.log(`🏁 Job ${job.id} completato!`);

    // Controlla lo stato della coda dopo ogni job processato
    const jobsInCoda = await personaQueue.getWaitingCount();
    const jobsAttivi = await personaQueue.getActiveCount();
    const jobsCompletati = await personaQueue.getCompletedCount();
    console.log(`📊 Job in attesa: ${jobsInCoda}`);
    console.log(`⚡ Job attivi: ${jobsAttivi}`);
    console.log(`✅ Job completati: ${jobsCompletati}`);
  },
  { connection: redisConnection }
);

personaWorker.on("drained", () => {
  console.log("🚀 Tutti i job sono stati processati!");
});

personaWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completato!`);
});

personaWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} fallito:`, err);
});

export default personaWorker;
