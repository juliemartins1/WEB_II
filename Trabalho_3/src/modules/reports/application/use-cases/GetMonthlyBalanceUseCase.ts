import type { TransactionRepository } from "../../../transactions/domain/repositories/TransactionRepository.js";

export type GetMonthlyBalanceInput = {
  userId: string;
  month: number;
  year: number;
};

export type GetMonthlyBalanceOutput = {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
};

export class GetMonthlyBalanceUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  public async execute(input: GetMonthlyBalanceInput): Promise<GetMonthlyBalanceOutput> {
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
