import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import express from "express";
import { personaQueue } from "./lib/queue.mjs"; // Assicurati che il percorso sia giusto!

const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/bull-board");

createBullBoard({
  queues: [new BullMQAdapter(personaQueue)],
  serverAdapter,
});

app.use("/bull-board", serverAdapter.getRouter());
app.listen(3001, () => {
  console.log("🚀 Bull Board disponibile su http://localhost:3001/bull-board");
});
