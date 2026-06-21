import type { Transaction } from "../../domain/entities/Transaction.js";
import type { TransactionFilters, TransactionRepository } from "../../domain/repositories/TransactionRepository.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

export type ListTransactionsInput = {
  userId: string;
  filters?: TransactionFilters;
};

export class ListTransactionsUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  public async execute(_input: ListTransactionsInput): Promise<Transaction[]> {
    void this.transactionRepository;

    throw new NotImplementedError("Implement transaction listing.");
  }
}
