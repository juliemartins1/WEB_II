import { describe, expect, it } from "vitest";

import { InvalidCredentialsError } from "../../../../../src/modules/auth/application/errors/InvalidCredentialsError.js";
import type { PasswordHasher } from "../../../../../src/modules/auth/application/services/PasswordHasher.js";
import type { AuthTokenPayload, TokenService } from "../../../../../src/modules/auth/application/services/TokenService.js";
import { LoginUseCase } from "../../../../../src/modules/auth/application/use-cases/LoginUseCase.js";
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

describe("LoginUseCase", () => {
  it("returns the user and a token when credentials are valid", async () => {
    const repository = new FakeUserRepository();
    await repository.create(
      User.create({
        id: "user-1",
        name: "Grace Hopper",
        email: "grace@example.com",
        passwordHash: "hashed:secret123"
      })
    );
    const useCase = new LoginUseCase(repository, new FakePasswordHasher(), new FakeTokenService());

    const result = await useCase.execute({
      email: "  GRACE@example.com  ",
      password: "secret123"
    });

    expect(result.user.id).toBe("user-1");
    expect(result.user.email).toBe("grace@example.com");
    expect(result.token).toBe("token-for:user-1");
  });

  it("rejects invalid credentials", async () => {
    const repository = new FakeUserRepository();
    await repository.create(
      User.create({
        id: "user-1",
        name: "Grace Hopper",
        email: "grace@example.com",
        passwordHash: "hashed:secret123"
      })
    );
    const useCase = new LoginUseCase(repository, new FakePasswordHasher(), new FakeTokenService());

    await expect(
      useCase.execute({
        email: "grace@example.com",
        password: "wrong-password"
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
