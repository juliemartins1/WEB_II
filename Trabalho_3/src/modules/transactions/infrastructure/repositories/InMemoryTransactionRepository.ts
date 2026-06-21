import type { Transaction } from "../../domain/entities/Transaction.js";
import type { TransactionFilters, TransactionRepository } from "../../domain/repositories/TransactionRepository.js";

export class InMemoryTransactionRepository implements TransactionRepository {
  private readonly transactions: Transaction[] = [];

  public async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((transaction) => transaction.id === id) ?? null;
  }

  public async listByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactions.filter((transaction) => {
      if (transaction.userId !== userId) return false;
      if (filters?.categoryId && transaction.categoryId !== filters.categoryId) return false;
      if (filters?.type && transaction.type !== filters.type) return false;
      if (filters?.month && transaction.occurredAt.getUTCMonth() + 1 !== filters.month) return false;
      if (filters?.year && transaction.occurredAt.getUTCFullYear() !== filters.year) return false;
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
