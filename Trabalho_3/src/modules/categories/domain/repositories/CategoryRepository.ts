import type { Category } from "../entities/Category.js";

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByUserIdAndName(userId: string, name: string): Promise<Category | null>;
  listByUserId(userId: string): Promise<Category[]>;
  create(category: Category): Promise<void>;
}
