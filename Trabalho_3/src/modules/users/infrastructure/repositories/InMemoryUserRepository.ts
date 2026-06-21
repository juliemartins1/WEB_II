import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import type { User } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/repositories/UserRepository.js";

export class InMemoryUserRepository implements UserRepository {
  public async findById(_id: string): Promise<User | null> {
    throw new NotImplementedError("Implement in-memory user lookup by id.");
  }

  public async findByEmail(_email: string): Promise<User | null> {
    throw new NotImplementedError("Implement in-memory user lookup by email.");
  }

  public async create(_user: User): Promise<void> {
    throw new NotImplementedError("Implement in-memory user persistence.");
  }
}
