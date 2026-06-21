import { describe, expect, it } from "vitest";

import { GetMonthlyBalanceUseCase } from "../../../../../src/modules/reports/application/use-cases/GetMonthlyBalanceUseCase.js";
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

  public async listByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactions.filter((transaction) => {
      if (transaction.userId !== userId) {
        return false;
      }

      if (filters?.month && transaction.occurredAt.getUTCMonth() + 1 !== filters.month) {
        return false;
      }

      if (filters?.year && transaction.occurredAt.getUTCFullYear() !== filters.year) {
        return false;
      }

      return true;
    });
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

describe("GetMonthlyBalanceUseCase", () => {
  it("calculates the monthly balance using only the current user's transactions", async () => {
    const repository = new FakeTransactionRepository([
      Transaction.create({
        id: "income-1",
        userId: "user-1",
        categoryId: "category-income",
        type: "income",
        description: "Salario",
        amount: 3000,
        occurredAt: new Date("2026-06-05T12:00:00.000Z")
      }),
      Transaction.create({
        id: "expense-1",
        userId: "user-1",
        categoryId: "category-expense",
        type: "expense",
        description: "Aluguel",
        amount: 1200,
        occurredAt: new Date("2026-06-06T12:00:00.000Z")
      }),
      Transaction.create({
        id: "expense-2",
        userId: "another-user",
        categoryId: "category-expense",
        type: "expense",
        description: "Nao deve entrar",
        amount: 999,
        occurredAt: new Date("2026-06-06T12:00:00.000Z")
      }),
      Transaction.create({
        id: "income-2",
        userId: "user-1",
        categoryId: "category-income",
        type: "income",
        description: "Mes anterior",
        amount: 500,
        occurredAt: new Date("2026-05-30T12:00:00.000Z")
      })
    ]);
    const useCase = new GetMonthlyBalanceUseCase(repository);

    const report = await useCase.execute({
      userId: "user-1",
      month: 6,
      year: 2026
    });

    expect(report).toEqual({
      month: 6,
      year: 2026,
      income: 3000,
      expense: 1200,
      balance: 1800
    });
  });
});
