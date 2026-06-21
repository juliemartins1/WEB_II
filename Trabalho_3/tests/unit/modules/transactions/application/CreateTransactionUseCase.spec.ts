import { describe, expect, it } from "vitest";

import { Category } from "../../../../../src/modules/categories/domain/entities/Category.js";
import type { CategoryRepository } from "../../../../../src/modules/categories/domain/repositories/CategoryRepository.js";
import { CategoryNotFoundError } from "../../../../../src/modules/transactions/application/errors/CategoryNotFoundError.js";
import { CreateTransactionUseCase } from "../../../../../src/modules/transactions/application/use-cases/CreateTransactionUseCase.js";
import { Transaction } from "../../../../../src/modules/transactions/domain/entities/Transaction.js";
import type {
  TransactionFilters,
  TransactionRepository
} from "../../../../../src/modules/transactions/domain/repositories/TransactionRepository.js";

class FakeCategoryRepository implements CategoryRepository {
  private readonly categories: Category[] = [];

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
  private readonly transactions: Transaction[] = [];

  public async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((transaction) => transaction.id === id) ?? null;
  }

  public async listByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactions.filter((transaction) => {
      if (transaction.userId !== userId) {
        return false;
      }

      if (filters?.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters?.type && transaction.type !== filters.type) {
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

describe("CreateTransactionUseCase", () => {
  it("creates an expense linked to the authenticated user's category", async () => {
    const categoryRepository = new FakeCategoryRepository();
    const transactionRepository = new FakeTransactionRepository();
    const category = Category.create({
      id: "category-1",
      userId: "user-1",
      name: "Mercado",
      kind: "expense"
    });
    await categoryRepository.create(category);
    const useCase = new CreateTransactionUseCase(transactionRepository, categoryRepository);

    const transaction = await useCase.execute({
      userId: "user-1",
      categoryId: "category-1",
      type: "expense",
      description: "Compras da semana",
      amount: 220.35,
      occurredAt: new Date("2026-06-12T12:00:00.000Z")
    });

    expect(transaction.id).toBeDefined();
    expect(transaction.userId).toBe("user-1");
    expect(transaction.categoryId).toBe("category-1");
    expect(transaction.status).toBe("pending");
  });

  it("rejects categories that do not belong to the current user", async () => {
    const categoryRepository = new FakeCategoryRepository();
    const transactionRepository = new FakeTransactionRepository();
    await categoryRepository.create(
      Category.create({
        id: "category-2",
        userId: "another-user",
        name: "Investimentos",
        kind: "income"
      })
    );
    const useCase = new CreateTransactionUseCase(transactionRepository, categoryRepository);

    await expect(
      useCase.execute({
        userId: "user-1",
        categoryId: "category-2",
        type: "income",
        description: "Dividendos",
        amount: 100,
        occurredAt: new Date("2026-06-12T12:00:00.000Z")
      })
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("rejects non-positive values", async () => {
    const categoryRepository = new FakeCategoryRepository();
    const transactionRepository = new FakeTransactionRepository();
    await categoryRepository.create(
      Category.create({
        id: "category-1",
        userId: "user-1",
        name: "Salario",
        kind: "income"
      })
    );
    const useCase = new CreateTransactionUseCase(transactionRepository, categoryRepository);

    await expect(
      useCase.execute({
        userId: "user-1",
        categoryId: "category-1",
        type: "income",
        description: "Salario",
        amount: -1,
        occurredAt: new Date("2026-06-12T12:00:00.000Z")
      })
    ).rejects.toThrow("Transaction amount must be greater than zero.");
  });
});
