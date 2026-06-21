import { describe, expect, it } from "vitest";

import { MarkExpenseAsPaidUseCase } from "../../../../../src/modules/transactions/application/use-cases/MarkExpenseAsPaidUseCase.js";
import { TransactionNotFoundError } from "../../../../../src/modules/transactions/application/errors/TransactionNotFoundError.js";
import { Transaction } from "../../../../../src/modules/transactions/domain/entities/Transaction.js";
import type {
  TransactionFilters,
  TransactionRepository
} from "../../../../../src/modules/transactions/domain/repositories/TransactionRepository.js";

class FakeTransactionRepository implements TransactionRepository {
  constructor(private readonly transactions: Transaction[] = []) {}

  public async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((transaction) => transaction.id === id) ?? null;
  }

  public async listByUserId(userId: string, _filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactions.filter((transaction) => transaction.userId === userId);
  }

  public async create(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }

  public async update(transaction: Transaction): Promise<void> {
    const index = this.transactions.findIndex((item) => item.id === transaction.id);

    if (index >= 0) {
      this.transactions[index] = transaction;
    }
  }
}

describe("MarkExpenseAsPaidUseCase", () => {
  it("marks an expense as paid for the current user", async () => {
    const expense = Transaction.create({
      id: "transaction-1",
      userId: "user-1",
      categoryId: "category-1",
      type: "expense",
      description: "Condominio",
      amount: 450,
      occurredAt: new Date("2026-06-12T12:00:00.000Z")
    });
    const repository = new FakeTransactionRepository([expense]);
    const useCase = new MarkExpenseAsPaidUseCase(repository);

    const updatedTransaction = await useCase.execute({
      userId: "user-1",
      transactionId: "transaction-1",
      paidAt: new Date("2026-06-15T12:00:00.000Z")
    });

    expect(updatedTransaction.status).toBe("paid");
    expect(updatedTransaction.paidAt).toEqual(new Date("2026-06-15T12:00:00.000Z"));
  });

  it("throws when the transaction does not belong to the current user", async () => {
    const expense = Transaction.create({
      id: "transaction-1",
      userId: "another-user",
      categoryId: "category-1",
      type: "expense",
      description: "Condominio",
      amount: 450,
      occurredAt: new Date("2026-06-12T12:00:00.000Z")
    });
    const repository = new FakeTransactionRepository([expense]);
    const useCase = new MarkExpenseAsPaidUseCase(repository);

    await expect(
      useCase.execute({
        userId: "user-1",
        transactionId: "transaction-1"
      })
    ).rejects.toBeInstanceOf(TransactionNotFoundError);
  });
});
