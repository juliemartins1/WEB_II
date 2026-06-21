import { createServer, type Server } from "node:http";

import type { Express } from "express";

type StartedServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

export const startTestServer = async (app: Express): Promise<StartedServer> => {
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not determine test server address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await closeServer(server);
    }
  };
};

export const requestJson = async <T = unknown>(
  baseUrl: string,
  path: string,
  init?: RequestInit
): Promise<{ status: number; body: T | null }> => {
  const headers = new Headers(init?.headers);

  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers
  });

  const text = await response.text();
  const body = text ? (JSON.parse(text) as T) : null;

  return {
    status: response.status,
    body
  };
};

const closeServer = async (server: Server): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};
