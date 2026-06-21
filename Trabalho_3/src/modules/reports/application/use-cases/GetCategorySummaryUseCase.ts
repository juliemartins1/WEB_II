import type { CategoryRepository } from "../../../categories/domain/repositories/CategoryRepository.js";
import type { TransactionRepository } from "../../../transactions/domain/repositories/TransactionRepository.js";

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

  public async execute(input: GetCategorySummaryInput): Promise<CategorySummaryItem[]> {
    const [transactions, categories] = await Promise.all([
      this.transactionRepository.listByUserId(input.userId, {
        month: input.month,
        year: input.year
      }),
      this.categoryRepository.listByUserId(input.userId)
    ]);

    const categoriesById = new Map(categories.map((category) => [category.id, category.name]));
    const totalsByCategory = new Map<string, number>();

    for (const transaction of transactions) {
      totalsByCategory.set(
        transaction.categoryId,
        (totalsByCategory.get(transaction.categoryId) ?? 0) + transaction.amount
      );
    }

    return Array.from(totalsByCategory.entries())
      .map(([categoryId, total]) => ({
        categoryId,
        categoryName: categoriesById.get(categoryId) ?? "Categoria não encontrada",
        total
      }))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }
}
