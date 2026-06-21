import type { Transaction } from "../../domain/entities/Transaction.js";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

export type MarkExpenseAsPaidInput = {
  userId: string;
  transactionId: string;
  paidAt?: Date;
};

export class MarkExpenseAsPaidUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  public async execute(_input: MarkExpenseAsPaidInput): Promise<Transaction> {
    void this.transactionRepository;

    throw new NotImplementedError("Implement expense payment update.");
  }
}
