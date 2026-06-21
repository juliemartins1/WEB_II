export class EmailAlreadyInUseError extends Error {
  constructor() {
    super("This email is already in use.");
    this.name = "EmailAlreadyInUseError";
  }
}
