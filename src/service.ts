import { Agent, setGlobalDispatcher } from "undici";

const agent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

setGlobalDispatcher(agent);

const pairWithDevice = (params: {
  terminalIP: number;
  terminalId: string;
  pairingCode: string;
}) => {
  return fetch(
    `https://${params.terminalIP}/POSitiveWebLink/1.0.0/pair?pairingCode=${params.pairingCode}&tid=${params.terminalId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .catch((err) => {
      throw { error: err.toString() };
    })
    .then((req) => req.text())
    .then((res) => {
      try {
        const json = JSON.parse(res);
        return json;
      } catch (e) {
        throw { error: res };
      }
    });
};

const createTransaction = (params: {
  terminalIP: number;
  terminalId: string;
  requestBody: string;
  authCode: string;
}) => {
  const requestBody = JSON.parse(params.requestBody);
  const url = new URL(
    `https://${params.terminalIP}/POSitiveWebLink/1.0.0/transaction`
  );
  url.searchParams.set("tid", params.terminalId);
  url.searchParams.set("silent", "false");
  url.searchParams.set("amountTrans", requestBody.amountTrans);
  url.searchParams.set("transType", requestBody.transType);

  return fetch(url.href, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.authCode}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .catch((err) => {
      throw { error: err.toString() };
    })
    .then((req) => req.text())
    .then((res) => {
      try {
        const json = JSON.parse(res);
        return json;
      } catch (e) {
        throw { error: res };
      }
    });
};

const transactionDetails = (params: {
  terminalIP: number;
  terminalId: string;
  authCode: string;
  transactionId: string;
}) => {
  const url = new URL(
    `https://${params.terminalIP}/POSitiveWebLink/1.0.0/transaction`
  );
  url.searchParams.set("tid", params.terminalId);
  url.searchParams.set("uti", params.transactionId);
  return fetch(url.href, {
    headers: {
      Authorization: `Bearer ${params.authCode}`,
      "Content-Type": "application/json",
    },
  })
    .catch((err) => {
      throw { error: err.toString() };
    })
    .then((req) => req.text())
    .then((res) => {
      try {
        const json = JSON.parse(res);
        return json;
      } catch (e) {
        throw { error: res };
      }
    });
};

export const API = {
  pairWithDevice,
  createTransaction,
  transactionDetails,
};
