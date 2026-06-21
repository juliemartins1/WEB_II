import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/main/app.js";
import { requestJson, startTestServer } from "../support/httpTestServer.js";

describe("Finance routes", () => {
  let testServer: Awaited<ReturnType<typeof startTestServer>>;

  beforeEach(async () => {
    testServer = await startTestServer(createApp());
  });

  afterEach(async () => {
    await testServer.close();
  });

  it("requires authentication to create categories", async () => {
    const result = await requestJson<{ message: string }>(testServer.baseUrl, "/categories", {
      method: "POST",
      body: JSON.stringify({
        name: "Moradia",
        kind: "expense"
      })
    });

    expect(result.status).toBe(401);
    expect(result.body).toEqual({
      message: "Authorization token is required."
    });
  });

  it("supports the main financial flow through HTTP", async () => {
    const register = await requestJson<{
      id: string;
      token: string;
    }>(testServer.baseUrl, "/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123"
      })
    });

    expect(register.status).toBe(201);
    expect(register.body?.token).toEqual(expect.any(String));

    const token = String(register.body?.token);
    const authHeaders = {
      authorization: `Bearer ${token}`
    };

    const categoryExpense = await requestJson<{
      id: string;
      name: string;
      kind: string;
    }>(testServer.baseUrl, "/categories", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Mercado",
        kind: "expense"
      })
    });

    expect(categoryExpense.status).toBe(201);
    expect(categoryExpense.body).toMatchObject({
      name: "Mercado",
      kind: "expense"
    });

    const categoryIncome = await requestJson<{
      id: string;
      name: string;
      kind: string;
    }>(testServer.baseUrl, "/categories", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Salario",
        kind: "income"
      })
    });

    expect(categoryIncome.status).toBe(201);

    const incomeTransaction = await requestJson<{
      id: string;
      type: string;
    }>(testServer.baseUrl, "/transactions", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        categoryId: categoryIncome.body?.id,
        type: "income",
        description: "Salario mensal",
        amount: 3000,
        occurredAt: "2026-06-05T12:00:00.000Z"
      })
    });

    expect(incomeTransaction.status).toBe(201);
    expect(incomeTransaction.body).toMatchObject({
      type: "income"
    });

    const expenseTransaction = await requestJson<{
      id: string;
      type: string;
      status: string;
    }>(testServer.baseUrl, "/transactions", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        categoryId: categoryExpense.body?.id,
        type: "expense",
        description: "Compras da semana",
        amount: 250,
        occurredAt: "2026-06-06T12:00:00.000Z"
      })
    });

    expect(expenseTransaction.status).toBe(201);
    expect(expenseTransaction.body).toMatchObject({
      type: "expense",
      status: "pending"
    });

    const filteredTransactions = await requestJson<Array<{ description: string }>>(
      testServer.baseUrl,
      `/transactions?month=6&year=2026&categoryId=${categoryExpense.body?.id}`,
      {
        method: "GET",
        headers: authHeaders
      }
    );

    expect(filteredTransactions.status).toBe(200);
    expect(filteredTransactions.body).toEqual([
      expect.objectContaining({
        description: "Compras da semana"
      })
    ]);

    const monthlyBalance = await requestJson<{
      income: number;
      expense: number;
      balance: number;
    }>(testServer.baseUrl, "/reports/monthly-balance?month=6&year=2026", {
      method: "GET",
      headers: authHeaders
    });

    expect(monthlyBalance.status).toBe(200);
    expect(monthlyBalance.body).toEqual({
      month: 6,
      year: 2026,
      income: 3000,
      expense: 250,
      balance: 2750
    });

    const categorySummary = await requestJson<
      Array<{ categoryId: string; categoryName: string; total: number }>
    >(testServer.baseUrl, "/reports/category-summary?month=6&year=2026", {
      method: "GET",
      headers: authHeaders
    });

    expect(categorySummary.status).toBe(200);
    expect(categorySummary.body).toEqual([
      {
        categoryId: String(categoryExpense.body?.id),
        categoryName: "Mercado",
        total: 250
      },
      {
        categoryId: String(categoryIncome.body?.id),
        categoryName: "Salario",
        total: 3000
      }
    ]);

    const payExpense = await requestJson<{ status: string }>(
      testServer.baseUrl,
      `/transactions/${expenseTransaction.body?.id}/pay`,
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          paidAt: "2026-06-08T12:00:00.000Z"
        })
      }
    );

    expect(payExpense.status).toBe(200);
    expect(payExpense.body).toMatchObject({
      status: "paid"
    });
  });
});
