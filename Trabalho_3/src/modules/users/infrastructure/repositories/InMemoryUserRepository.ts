import type { User } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/repositories/UserRepository.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  public async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find((user) => user.email === normalizedEmail) ?? null;
  }

  public async create(user: User): Promise<void> {
    this.users.push(user);
  }
}
