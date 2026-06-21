import type { Category, CategoryKind } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

export type CreateCategoryInput = {
  userId: string;
  name: string;
  kind: CategoryKind;
};

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async execute(_input: CreateCategoryInput): Promise<Category> {
    void this.categoryRepository;

    throw new NotImplementedError("Implement category creation.");
  }
}
