export class InvalidTokenError extends Error {
  constructor() {
    super("Invalid authentication token.");
    this.name = "InvalidTokenError";
  }
}
