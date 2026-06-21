import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import type { Category } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository.js";

export class InMemoryCategoryRepository implements CategoryRepository {
  public async findById(_id: string): Promise<Category | null> {
    throw new NotImplementedError("Implement in-memory category lookup by id.");
  }

  public async findByUserIdAndName(_userId: string, _name: string): Promise<Category | null> {
    throw new NotImplementedError("Implement in-memory category lookup by user and name.");
  }

  public async listByUserId(_userId: string): Promise<Category[]> {
    throw new NotImplementedError("Implement in-memory category listing.");
  }

  public async create(_category: Category): Promise<void> {
    throw new NotImplementedError("Implement in-memory category persistence.");
  }
}
