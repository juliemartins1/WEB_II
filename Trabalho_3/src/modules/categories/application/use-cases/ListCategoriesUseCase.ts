import type { Category } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async execute(userId: string): Promise<Category[]> {
    return this.categoryRepository.listByUserId(userId);
  }
}
