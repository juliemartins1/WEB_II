import { describe, expect, it } from "vitest";

import { EmailAlreadyInUseError } from "../../../../../src/modules/auth/application/errors/EmailAlreadyInUseError.js";
import type { PasswordHasher } from "../../../../../src/modules/auth/application/services/PasswordHasher.js";
import type { AuthTokenPayload, TokenService } from "../../../../../src/modules/auth/application/services/TokenService.js";
import { RegisterUserUseCase } from "../../../../../src/modules/auth/application/use-cases/RegisterUserUseCase.js";
import { User } from "../../../../../src/modules/users/domain/entities/User.js";
import type { UserRepository } from "../../../../../src/modules/users/domain/repositories/UserRepository.js";

class FakeUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  public async findById(id: string): Promise<User | null> {
    return Array.from(this.users.values()).find((user) => user.id === id) ?? null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.users.get(email) ?? null;
  }

  public async create(user: User): Promise<void> {
    this.users.set(user.email, user);
  }
}

class FakePasswordHasher implements PasswordHasher {
  public async hash(value: string): Promise<string> {
    return `hashed:${value}`;
  }

  public async compare(value: string, hash: string): Promise<boolean> {
    return hash === `hashed:${value}`;
  }
}

class FakeTokenService implements TokenService {
  public async sign(payload: AuthTokenPayload): Promise<string> {
    return `token-for:${payload.userId}`;
  }

  public async verify(token: string): Promise<AuthTokenPayload> {
    return {
      userId: token.replace("token-for:", "")
    };
  }
}

describe("RegisterUserUseCase", () => {
  it("creates a user with normalized email, hashed password and token", async () => {
    const repository = new FakeUserRepository();
    const useCase = new RegisterUserUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeTokenService()
    );

    const result = await useCase.execute({
      name: "  Ada Lovelace  ",
      email: "  ADA@EXAMPLE.COM  ",
      password: "secret123"
    });

    expect(result.user.id).toBeDefined();
    expect(result.user.name).toBe("Ada Lovelace");
    expect(result.user.email).toBe("ada@example.com");
    expect(result.user.passwordHash).toBe("hashed:secret123");
    expect(result.token).toBe(`token-for:${result.user.id}`);
  });

  it("rejects duplicate emails", async () => {
    const repository = new FakeUserRepository();
    const useCase = new RegisterUserUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeTokenService()
    );

    await useCase.execute({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "secret123"
    });

    await expect(
      useCase.execute({
        name: "Another Ada",
        email: "ada@example.com",
        password: "another-secret"
      })
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });
});
