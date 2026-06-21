export class CategoryNotFoundError extends Error {
  constructor() {
    super("Category not found for the current user.");
    this.name = "CategoryNotFoundError";
  }
}
