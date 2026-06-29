export class ListCategoriesUseCase {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async execute(userId) {
        return this.categoryRepository.listByUserId(userId);
    }
}
