import Fastify from "fastify";
import cors from "@fastify/cors";
import fasitfyFormbody from "@fastify/formbody";
import { dirname, join } from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import { API } from "./service.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  // put your options here
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
fastify.register(fastifyStatic, {
  root: join(__dirname, "..", "ui", "dist"), // Adjust 'client/build' to your React build directory path
  prefix: "/", // Serve static files from the root URL
});

fastify.register(fasitfyFormbody);

fastify.post<{
  Body: { terminalIP: number; terminalId: string; pairingCode: string };
}>("/pairWith", (req, reply) => {
  API.pairWithDevice(req.body)
    .then((json) => {
      reply.send(json);
    })
    .catch((err) => {
      reply.status(400).send({ error: err.error });
    });
});

fastify.post<{
  Body: {
    terminalIP: number;
    terminalId: string;
    requestBody: string;
    authCode: string;
  };
}>("/createTransaction", (req, reply) => {
  API.createTransaction(req.body)
    .then((json) => {
      reply.send(json);
    })
    .catch((err) => {
      reply.status(400).send({ error: err.error });
    });
});

fastify.post<{
  Body: {
    terminalIP: number;
    terminalId: string;
    authCode: string;
    transactionId: string;
  };
}>("/transactionDetails", (req, reply) => {
  API.transactionDetails(req.body)
    .then((json) => {
      reply.send(json);
    })
    .catch((err) => {
      reply.status(400).send({ error: err.error });
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
