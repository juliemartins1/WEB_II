import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import type { Category } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository.js";

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async findById(id: string): Promise<Category | null> {
    return this.categories.find(c => c.id === id) ?? null;
  }

  async findByUserIdAndName(
    userId: string,
    name: string
  ): Promise<Category | null> {
    return (
      this.categories.find(
        c =>
          c.userId === userId &&
          c.name.toLowerCase() === name.toLowerCase()
      ) ?? null
    );
  }

  async listByUserId(userId: string): Promise<Category[]> {
    return this.categories.filter(c => c.userId === userId);
  }

  async create(category: Category): Promise<void> {
    this.categories.push(category);
  }
}
