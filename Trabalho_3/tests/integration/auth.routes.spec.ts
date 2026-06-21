import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/main/app.js";
import { requestJson, startTestServer } from "../support/httpTestServer.js";

describe("Authentication routes", () => {
  let testServer: Awaited<ReturnType<typeof startTestServer>>;

  beforeEach(async () => {
    testServer = await startTestServer(createApp());
  });

  afterEach(async () => {
    await testServer.close();
  });

  it("registers a user and returns an authentication token", async () => {
    const result = await requestJson<{
      id: string;
      name: string;
      email: string;
      token: string;
    }>(testServer.baseUrl, "/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123"
      })
    });

    expect(result.status).toBe(201);
    expect(result.body).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com"
    });
    expect(result.body?.id).toBeDefined();
    expect(result.body?.token).toEqual(expect.any(String));
  });

  it("rejects duplicate registration and allows login with valid credentials", async () => {
    const firstRegister = await requestJson(testServer.baseUrl, "/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Grace Hopper",
        email: "grace@example.com",
        password: "secret123"
      })
    });

    expect(firstRegister.status).toBe(201);

    const duplicateRegister = await requestJson<{ message: string }>(
      testServer.baseUrl,
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          name: "Another Grace",
          email: "grace@example.com",
          password: "another-secret"
        })
      }
    );

    expect(duplicateRegister.status).toBe(409);
    expect(duplicateRegister.body).toEqual({
      message: "This email is already in use."
    });

    const login = await requestJson<{
      id: string;
      email: string;
      token: string;
    }>(testServer.baseUrl, "/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "  GRACE@example.com  ",
        password: "secret123"
      })
    });

    expect(login.status).toBe(200);
    expect(login.body).toMatchObject({
      email: "grace@example.com"
    });
    expect(login.body?.token).toEqual(expect.any(String));
  });
});
