import { describe, expect, it } from "vitest";

import { Transaction } from "../../../../../src/modules/transactions/domain/entities/Transaction.js";

describe("Transaction", () => {
  it("creates an expense with pending status by default", () => {
    const transaction = Transaction.create({
      userId: "user-1",
      categoryId: "category-1",
      type: "expense",
      description: "  Mercado  ",
      amount: 125.5,
      occurredAt: new Date("2026-06-10T12:00:00.000Z")
    });

    expect(transaction.id).toBeDefined();
    expect(transaction.description).toBe("Mercado");
    expect(transaction.status).toBe("pending");
    expect(transaction.paidAt).toBeNull();
  });

  it("throws when the amount is zero or negative", () => {
    expect(() =>
      Transaction.create({
        userId: "user-1",
        categoryId: "category-1",
        type: "income",
        description: "Salario",
        amount: 0,
        occurredAt: new Date("2026-06-10T12:00:00.000Z")
      })
    ).toThrow("Transaction amount must be greater than zero.");
  });

  it("marks an expense as paid", () => {
    const transaction = Transaction.create({
      userId: "user-1",
      categoryId: "category-1",
      type: "expense",
      description: "Aluguel",
      amount: 1500,
      occurredAt: new Date("2026-06-05T12:00:00.000Z")
    });
    const paidAt = new Date("2026-06-07T12:00:00.000Z");

    const paidTransaction = transaction.markAsPaid(paidAt);

    expect(paidTransaction.status).toBe("paid");
    expect(paidTransaction.paidAt).toBe(paidAt);
  });

  it("throws when trying to mark an income as paid", () => {
    const transaction = Transaction.create({
      userId: "user-1",
      categoryId: "category-1",
      type: "income",
      description: "Freelance",
      amount: 800,
      occurredAt: new Date("2026-06-05T12:00:00.000Z")
    });

    expect(() => transaction.markAsPaid()).toThrow("Only expenses can be marked as paid.");
  });
});
