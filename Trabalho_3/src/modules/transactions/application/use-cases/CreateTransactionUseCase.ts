import type { CategoryRepository } from "../../../categories/domain/repositories/CategoryRepository.js";
import type { Transaction, TransactionType } from "../../domain/entities/Transaction.js";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

export type CreateTransactionInput = {
  userId: string;
  categoryId: string;
  type: TransactionType;
  description: string;
  amount: number;
  occurredAt: Date;
};

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  public async execute(_input: CreateTransactionInput): Promise<Transaction> {
    void this.transactionRepository;
    void this.categoryRepository;

    throw new NotImplementedError("Implement transaction creation.");
  }
}
