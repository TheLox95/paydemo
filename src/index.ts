import Fastify from "fastify";
import cors from '@fastify/cors'
import fastifyView from "@fastify/view";
import fasitfyFormbody from "@fastify/formbody";
import { Edge } from "edge.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  // put your options here
})

const engine = new Edge();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
engine.mount(join(__dirname, "..", "templates"));

fastify.register(fastifyView, {
  engine: {
    //@ts-ignore
    edge: engine,
  },
});

fastify.register(fasitfyFormbody);

fastify.post<{
  Body: { terminalIp: number; terminalId: string; pairingCode: string };
}>("/pairWith", (req, reply) => {
  fetch(
    `https://${req.body.terminalIp}/POSitiveWebLink/1.0.0/pair?pairingCode=${req.body.pairingCode}&tid=${req.body.terminalId}`
  )
    .then((req) => req.json())
    .then((json) => {
      reply.send(json);
    })
    .catch((err) => {
      reply.status(400).send({ error: err.toString() });
    });
});

fastify.post<{
  Body: { terminalIp: number; terminalId: string; requestBody: string };
}>("/createTransaction", (req, reply) => {
  fetch(
    `https://${req.body.terminalIp}:8080/POSitiveWebLink/1.0.0/transaction?tid=${req.body.terminalId}&silent=false`,
    {
      method: "POST",
      body: req.body.requestBody,
    }
  )
    .then((req) => req.json())
    .then((json) => {
      reply.view("transactionResult.edge", {
        response: JSON.stringify(json, null, "\t"),
      });
    })
    .catch((err) => {
      reply.status(400).send({ error: err.toString() });
    });
});

// Run the server!
fastify.listen({ port: 4000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
