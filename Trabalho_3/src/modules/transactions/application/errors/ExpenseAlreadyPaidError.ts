export class ExpenseAlreadyPaidError extends Error {
  constructor() {
    super("Expense is already marked as paid.");
    this.name = "ExpenseAlreadyPaidError";
  }
}
