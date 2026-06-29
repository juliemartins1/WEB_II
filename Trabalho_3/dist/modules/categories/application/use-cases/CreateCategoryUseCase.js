import { Category } from "../../domain/entities/Category.js";
import { CategoryAlreadyExistsError } from "../errors/CategoryAlreadyExistsError.js";
export class CreateCategoryUseCase {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async execute(input) {
        const exists = await this.categoryRepository.findByUserIdAndName(input.userId, input.name);
        if (exists) {
            throw new CategoryAlreadyExistsError();
        }
        const category = Category.create({
            userId: input.userId,
            name: input.name,
            kind: input.kind,
        });
        await this.categoryRepository.create(category);
        return category;
    }
}
