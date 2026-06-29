export class GetCategorySummaryUseCase {
    transactionRepository;
    categoryRepository;
    constructor(transactionRepository, categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }
    async execute(input) {
        const [transactions, categories] = await Promise.all([
            this.transactionRepository.listByUserId(input.userId, {
                month: input.month,
                year: input.year
            }),
            this.categoryRepository.listByUserId(input.userId)
        ]);
        const categoriesById = new Map(categories.map((category) => [category.id, category.name]));
        const totalsByCategory = new Map();
        for (const transaction of transactions) {
            totalsByCategory.set(transaction.categoryId, (totalsByCategory.get(transaction.categoryId) ?? 0) + transaction.amount);
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
