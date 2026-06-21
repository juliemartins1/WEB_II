import { describe, expect, it } from "vitest";

import { CategoryAlreadyExistsError } from "../../../../../src/modules/categories/application/errors/CategoryAlreadyExistsError.js";
import { CreateCategoryUseCase } from "../../../../../src/modules/categories/application/use-cases/CreateCategoryUseCase.js";
import { Category } from "../../../../../src/modules/categories/domain/entities/Category.js";
import type { CategoryRepository } from "../../../../../src/modules/categories/domain/repositories/CategoryRepository.js";

class FakeCategoryRepository implements CategoryRepository {
  private readonly categories: Category[] = [];

  public async findById(id: string): Promise<Category | null> {
    return this.categories.find((category) => category.id === id) ?? null;
  }

  public async findByUserIdAndName(userId: string, name: string): Promise<Category | null> {
    return (
      this.categories.find(
        (category) =>
          category.userId === userId && category.name.toLowerCase() === name.trim().toLowerCase()
      ) ?? null
    );
  }

  public async listByUserId(userId: string): Promise<Category[]> {
    return this.categories.filter((category) => category.userId === userId);
  }

  public async create(category: Category): Promise<void> {
    this.categories.push(category);
  }
}

describe("CreateCategoryUseCase", () => {
  it("creates a category for the authenticated user", async () => {
    const repository = new FakeCategoryRepository();
    const useCase = new CreateCategoryUseCase(repository);

    const category = await useCase.execute({
      userId: "user-1",
      name: "  Alimentacao  ",
      kind: "expense"
    });

    expect(category.id).toBeDefined();
    expect(category.userId).toBe("user-1");
    expect(category.name).toBe("Alimentacao");
  });

  it("rejects duplicate category names for the same user", async () => {
    const repository = new FakeCategoryRepository();
    const useCase = new CreateCategoryUseCase(repository);

    await useCase.execute({
      userId: "user-1",
      name: "Moradia",
      kind: "expense"
    });

    await expect(
      useCase.execute({
        userId: "user-1",
        name: "  moradia  ",
        kind: "expense"
      })
    ).rejects.toBeInstanceOf(CategoryAlreadyExistsError);
  });

  it("allows the same category name for different users", async () => {
    const repository = new FakeCategoryRepository();
    const useCase = new CreateCategoryUseCase(repository);

    await useCase.execute({
      userId: "user-1",
      name: "Transporte",
      kind: "expense"
    });

    const category = await useCase.execute({
      userId: "user-2",
      name: "Transporte",
      kind: "expense"
    });

    expect(category.userId).toBe("user-2");
  });
});
