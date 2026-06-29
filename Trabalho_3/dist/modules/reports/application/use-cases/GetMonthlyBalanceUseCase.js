export class GetMonthlyBalanceUseCase {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async execute(input) {
        const transactions = await this.transactionRepository.listByUserId(input.userId, {
            month: input.month,
            year: input.year
        });
        const income = transactions
            .filter((transaction) => transaction.type === "income")
            .reduce((total, transaction) => total + transaction.amount, 0);
        const expense = transactions
            .filter((transaction) => transaction.type === "expense")
            .reduce((total, transaction) => total + transaction.amount, 0);
        return {
            month: input.month,
            year: input.year,
            income,
            expense,
            balance: income - expense
        };
    }
}
