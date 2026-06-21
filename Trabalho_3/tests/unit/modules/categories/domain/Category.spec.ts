import { describe, expect, it } from "vitest";

import { Category } from "../../../../../src/modules/categories/domain/entities/Category.js";

describe("Category", () => {
  it("creates a category with normalized name", () => {
    const category = Category.create({
      userId: "user-1",
      name: "  Alimentacao  ",
      kind: "expense"
    });

    expect(category.id).toBeDefined();
    expect(category.userId).toBe("user-1");
    expect(category.name).toBe("Alimentacao");
    expect(category.kind).toBe("expense");
    expect(category.createdAt).toBeInstanceOf(Date);
  });

  it("throws when the category name is empty after trimming", () => {
    expect(() =>
      Category.create({
        userId: "user-1",
        name: "   ",
        kind: "income"
      })
    ).toThrow("Category name is required.");
  });
});
