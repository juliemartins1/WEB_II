import { ExpenseAlreadyPaidError } from "../errors/ExpenseAlreadyPaidError.js";
import { TransactionNotFoundError } from "../errors/TransactionNotFoundError.js";
export class MarkExpenseAsPaidUseCase {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async execute(input) {
        const transaction = await this.transactionRepository.findById(input.transactionId);
        if (!transaction || transaction.userId !== input.userId) {
            throw new TransactionNotFoundError();
        }
        try {
            const paidTransaction = transaction.markAsPaid(input.paidAt);
            await this.transactionRepository.update(paidTransaction);
            return paidTransaction;
        }
        catch (error) {
            if (error instanceof Error && error.message === "Expense already paid.") {
                throw new ExpenseAlreadyPaidError();
            }
            throw error;
        }
    }
}
