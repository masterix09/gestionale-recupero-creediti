import express from "express";
import { personaQueue } from "./lib/queue.js";

const app = express();
app.use(express.json());

app.post("/add-job", async (req, res) => {
  try {
    const { personeDaCreare, personeDaAggiornare } = req.body;
    await personaQueue.add("processPersona", {
      personeDaCreare,
      personeDaAggiornare,
    });
    res.status(200).json({ message: "Job added!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
