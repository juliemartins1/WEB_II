import { describe, expect, it } from "vitest";

import { Category } from "../../../../../src/modules/categories/domain/entities/Category.js";
import type { CategoryRepository } from "../../../../../src/modules/categories/domain/repositories/CategoryRepository.js";
import { GetCategorySummaryUseCase } from "../../../../../src/modules/reports/application/use-cases/GetCategorySummaryUseCase.js";
import { Transaction } from "../../../../../src/modules/transactions/domain/entities/Transaction.js";
import type {
  TransactionFilters,
  TransactionRepository
} from "../../../../../src/modules/transactions/domain/repositories/TransactionRepository.js";

class FakeCategoryRepository implements CategoryRepository {
  constructor(private readonly categories: Category[] = []) {}

  public async findById(id: string): Promise<Category | null> {
    return this.categories.find((category) => category.id === id) ?? null;
  }

  public async findByUserIdAndName(userId: string, name: string): Promise<Category | null> {
    return (
      this.categories.find(
        (category) =>
          category.userId === userId && category.name.toLowerCase() === name.trim().toLowerCase()
      ) ?? null
    );
  }

  public async listByUserId(userId: string): Promise<Category[]> {
    return this.categories.filter((category) => category.userId === userId);
  }

  public async create(category: Category): Promise<void> {
    this.categories.push(category);
  }
}

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

describe("GetCategorySummaryUseCase", () => {
  it("groups monthly totals by category", async () => {
    const categoryRepository = new FakeCategoryRepository([
      Category.create({
        id: "category-1",
        userId: "user-1",
        name: "Mercado",
        kind: "expense"
      }),
      Category.create({
        id: "category-2",
        userId: "user-1",
        name: "Salario",
        kind: "income"
      })
    ]);
    const transactionRepository = new FakeTransactionRepository([
      Transaction.create({
        id: "transaction-1",
        userId: "user-1",
        categoryId: "category-1",
        type: "expense",
        description: "Feira",
        amount: 150,
        occurredAt: new Date("2026-06-01T12:00:00.000Z")
      }),
      Transaction.create({
        id: "transaction-2",
        userId: "user-1",
        categoryId: "category-1",
        type: "expense",
        description: "Supermercado",
        amount: 200,
        occurredAt: new Date("2026-06-03T12:00:00.000Z")
      }),
      Transaction.create({
        id: "transaction-3",
        userId: "user-1",
        categoryId: "category-2",
        type: "income",
        description: "Pagamento mensal",
        amount: 3000,
        occurredAt: new Date("2026-06-05T12:00:00.000Z")
      })
    ]);
    const useCase = new GetCategorySummaryUseCase(transactionRepository, categoryRepository);

    const summary = await useCase.execute({
      userId: "user-1",
      month: 6,
      year: 2026
    });

    expect(summary).toEqual([
      {
        categoryId: "category-1",
        categoryName: "Mercado",
        total: 350
      },
      {
        categoryId: "category-2",
        categoryName: "Salario",
        total: 3000
      }
    ]);
  });
});
