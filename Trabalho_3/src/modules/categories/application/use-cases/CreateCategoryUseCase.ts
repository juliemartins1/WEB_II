import { Category, type CategoryKind } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository.js";
import { CategoryAlreadyExistsError } from "../errors/CategoryAlreadyExistsError.js";

export type CreateCategoryInput = {
  userId: string;
  name: string;
  kind: CategoryKind;
};

export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository
  ) { }

  public async execute(
    input: CreateCategoryInput
  ): Promise<Category> {
    const exists =
      await this.categoryRepository.findByUserIdAndName(
        input.userId,
        input.name
      );

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