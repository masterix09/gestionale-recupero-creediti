import { createBullBoard } from "@bull-board/api/";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { personaQueue } from "@/lib/queue"; // Assicurati che sia importato correttamente

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(personaQueue)], // Usa BullMQAdapter
  serverAdapter,
});

export { serverAdapter };
