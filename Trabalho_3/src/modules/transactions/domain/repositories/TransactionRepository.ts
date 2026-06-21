import type { Transaction, TransactionType } from "../entities/Transaction.js";

export type TransactionFilters = {
  month?: number;
  year?: number;
  categoryId?: string;
  type?: TransactionType;
};

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  listByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
}
