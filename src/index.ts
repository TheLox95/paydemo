import Fastify from "fastify";
import cors from "@fastify/cors";
import fasitfyFormbody from "@fastify/formbody";
import { dirname, join } from "path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import { Agent, setGlobalDispatcher } from "undici";

const agent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

setGlobalDispatcher(agent);

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
  fetch(
    `https://${req.body.terminalIP}/POSitiveWebLink/1.0.0/pair?pairingCode=${req.body.pairingCode}&tid=${req.body.terminalId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((req) => req.text())
    .then((res) => {
      try {
        const json = JSON.parse(res);
        reply.send(json);
      } catch (e) {
        reply.status(400).send({ error: res });
      }
    })
    .catch((err) => {
      reply.status(400).send({ error: err.toString() });
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
  const requestBody = JSON.parse(req.body.requestBody)
  fetch(
    `https://${req.body.terminalIP}/POSitiveWebLink/1.0.0/transaction?tid=${req.body.terminalId}&silent=false&amountTrans=${requestBody.amountTrans}&transType=${requestBody.transType}`,
    {
      method: "POST",
      headers: {
        Authorization: req.body.authCode,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  )
    .then((req) => req.text())
    .then((res) => {
      try {
        const json = JSON.parse(res);
        reply.send(json);
      } catch (e) {
        reply.status(400).send({ error: res });
      }
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
