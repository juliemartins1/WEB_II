import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import type { Transaction } from "../../domain/entities/Transaction.js";
import type { TransactionFilters, TransactionRepository } from "../../domain/repositories/TransactionRepository.js";

export class InMemoryTransactionRepository implements TransactionRepository {
  public async findById(_id: string): Promise<Transaction | null> {
    throw new NotImplementedError("Implement in-memory transaction lookup by id.");
  }

  public async listByUserId(_userId: string, _filters?: TransactionFilters): Promise<Transaction[]> {
    throw new NotImplementedError("Implement in-memory transaction listing.");
  }

  public async create(_transaction: Transaction): Promise<void> {
    throw new NotImplementedError("Implement in-memory transaction persistence.");
  }

  public async update(_transaction: Transaction): Promise<void> {
    throw new NotImplementedError("Implement in-memory transaction update.");
  }
}
