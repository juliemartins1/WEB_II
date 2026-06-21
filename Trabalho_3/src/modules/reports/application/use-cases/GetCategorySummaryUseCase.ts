import type { CategoryRepository } from "../../../categories/domain/repositories/CategoryRepository.js";
import type { TransactionRepository } from "../../../transactions/domain/repositories/TransactionRepository.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

export type GetCategorySummaryInput = {
  userId: string;
  month: number;
  year: number;
};

export type CategorySummaryItem = {
  categoryId: string;
  categoryName: string;
  total: number;
};

export class GetCategorySummaryUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  public async execute(_input: GetCategorySummaryInput): Promise<CategorySummaryItem[]> {
    void this.transactionRepository;
    void this.categoryRepository;

    throw new NotImplementedError("Implement category summary report.");
  }
}
