import { useCallback, useState } from "react";

type BaseConfig = {
  terminalId: number;
  terminalIP: string;
  pairingCode: string;
  requestBody: string;
};

const API_URL = "http://localhost:4000";

const API = {
  pair: (body: BaseConfig) => {
    return fetch(`${API_URL}/pairWith`, {
      method: "post",
      body: JSON.stringify(body),
    });
  },
  transaction: (body: BaseConfig & { authCode: string }) => {
    return fetch(`${API_URL}/createTransaction`, {
      method: "post",
      body: JSON.stringify(body),
    });
  },
};

const InitConfig = {
  transType: "SALE",
  amountTrans: 1000,
  reference: "TEST CARD",
  language: "en_GB",
};

function App() {
  const [status, setStatus] = useState<{
    lastCallSucced?: boolean;
    message?: any;
  }>({
    lastCallSucced: undefined,
    message: undefined,
  });
  const [config, setConfig] = useState<BaseConfig>({
    terminalId: 1853325617,
    terminalIP: "192.168.0.174",
    pairingCode: "",
    requestBody: JSON.stringify(InitConfig, null, "\t"),
  });

  const [pairingResponse, setPairingResponse] = useState<
    | {
        serialNumber: string;
        authToken: string;
      }
    | undefined
  >();

  const handleChange = useCallback((key: keyof typeof config) => {
    return (
      e: React.ChangeEvent<HTMLInputElement> &
        React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setConfig((prev) => {
        return {
          ...prev,
          [key]: e.target.value,
        };
      });
    };
  }, []);

  const handlePairing: NonNullable<
    React.HTMLProps<HTMLFormElement>["onSubmit"]
  > = useCallback((event) => {
    event.preventDefault(); // Prevent default form submission
    setStatus({ lastCallSucced: undefined, message: undefined });
    API.pair(config)
      .then((res) => res.json())
      .then((json) => {
        setPairingResponse(json);
        setStatus({ lastCallSucced: true, message: json });
      });
  }, []);

  const handleTransaction: NonNullable<
    React.HTMLProps<HTMLFormElement>["onSubmit"]
  > = useCallback(
    (event) => {
      event.preventDefault(); // Prevent default form submission
      setStatus({ lastCallSucced: undefined, message: undefined });
      if (pairingResponse) {
        API.transaction({ ...config, authCode: pairingResponse?.authToken })
          .then((res) => res.json())
          .then((json) => {
            setStatus({ lastCallSucced: true, message: json });
          });
      }
    },
    [pairingResponse]
  );

  return (
    <>
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold text-center">
          Welcome to Our Service
        </h1>
      </header>
      {status.message.error !== undefined && (
        <div className="bg-red-600 text-white p-4">
          <p className="text-l font-bold text-center">{status.message.error}</p>
        </div>
      )}

      <main className="flex-grow flex items-center justify-around">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Terminal Config
          </h2>
          <div className="mb-4">
            <label
              htmlFor="terminalIp"
              className="block text-sm font-medium text-gray-700"
            >
              Terminal IP
            </label>
            <input
              id="terminalIp"
              name="terminalIp"
              required
              defaultValue={config.terminalIP}
              onChange={handleChange("terminalIP")}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="127.0.0.1"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="terminalId"
              className="block text-sm font-medium text-gray-700"
            >
              Terminal ID
            </label>
            <input
              id="terminalId"
              name="terminalId"
              required
              defaultValue={config.terminalId}
              onChange={handleChange("terminalId")}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <h2 className="text-xl font-semibold mb-6 text-center">Pairing</h2>
          <form onSubmit={handlePairing}>
            <div className="mb-4">
              <label
                htmlFor="pairingCode"
                className="block text-sm font-medium text-gray-700"
              >
                Pairing Code
              </label>
              <input
                id="pairingCode"
                name="pairingCode"
                required
                defaultValue={config.pairingCode}
                onChange={handleChange("pairingCode")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Pair
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Test Transaction
          </h2>
          <form onSubmit={handleTransaction}>
            <div className="mb-6">
              <label
                htmlFor="requestBody"
                className="block text-sm font-medium text-gray-700"
              >
                Request Body
              </label>
              <textarea
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                name="requestBody"
                onChange={handleChange("requestBody")}
                rows={10}
                cols={50}
              >
                {config.requestBody}
              </textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-gray-200 text-center p-4">
        <p className="text-sm text-gray-600">
          © 2025 Your Company. All rights reserved.
        </p>
      </footer>
    </>
  );
}

export default App;
