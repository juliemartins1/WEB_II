export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super("This category already exists for the current user.");
    this.name = "CategoryAlreadyExistsError";
  }
}
