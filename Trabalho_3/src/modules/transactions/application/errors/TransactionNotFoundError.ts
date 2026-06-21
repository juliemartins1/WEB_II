export class TransactionNotFoundError extends Error {
  constructor() {
    super("Transaction not found for the current user.");
    this.name = "TransactionNotFoundError";
  }
}
