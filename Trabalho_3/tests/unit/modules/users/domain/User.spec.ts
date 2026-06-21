import { describe, expect, it } from "vitest";

import { User } from "../../../../../src/modules/users/domain/entities/User.js";

describe("User", () => {
  it("creates a user with normalized name and email", () => {
    const user = User.create({
      name: "  Ada Lovelace  ",
      email: "  ADA@EXAMPLE.COM  ",
      passwordHash: "hashed-password"
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe("Ada Lovelace");
    expect(user.email).toBe("ada@example.com");
    expect(user.passwordHash).toBe("hashed-password");
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("throws when the name is empty after trimming", () => {
    expect(() =>
      User.create({
        name: "   ",
        email: "ada@example.com",
        passwordHash: "hashed-password"
      })
    ).toThrow("User name is required.");
  });

  it("throws when the email format is invalid", () => {
    expect(() =>
      User.create({
        name: "Ada Lovelace",
        email: "invalid-email",
        passwordHash: "hashed-password"
      })
    ).toThrow("A valid user email is required.");
  });
});
