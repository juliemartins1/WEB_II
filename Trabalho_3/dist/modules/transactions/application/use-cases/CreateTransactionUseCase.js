import { Transaction } from "../../domain/entities/Transaction.js";
import { CategoryNotFoundError } from "../errors/CategoryNotFoundError.js";
export class CreateTransactionUseCase {
    transactionRepository;
    categoryRepository;
    constructor(transactionRepository, categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }
    async execute(input) {
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
