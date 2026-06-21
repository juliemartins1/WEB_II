import type { TransactionRepository } from "../../../transactions/domain/repositories/TransactionRepository.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

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

  public async execute(_input: GetMonthlyBalanceInput): Promise<GetMonthlyBalanceOutput> {
    void this.transactionRepository;

    throw new NotImplementedError("Implement monthly balance report.");
  }
}
