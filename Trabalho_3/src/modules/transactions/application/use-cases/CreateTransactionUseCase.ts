import type { CategoryRepository } from "../../../categories/domain/repositories/CategoryRepository.js";
import { Transaction, type TransactionType } from "../../domain/entities/Transaction.js";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository.js";
import { CategoryNotFoundError } from "../errors/CategoryNotFoundError.js";

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

  public async execute(input: CreateTransactionInput): Promise<Transaction> {
    const category = await this.categoryRepository.findById(input.categoryId);

    if (!category || category.userId !== input.userId) {
      throw new CategoryNotFoundError();
    }

    const transaction = Transaction.create({
      userId: input.userId,
      categoryId: input.categoryId,
      type: input.type,
      description: input.description,
      amount: input.amount,
      occurredAt: input.occurredAt
    });

    await this.transactionRepository.create(transaction);

    return transaction;
  }
}
