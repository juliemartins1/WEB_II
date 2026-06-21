import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import crypto from "node:crypto";
export type TransactionType = "income" | "expense";
export type ExpenseStatus = "pending" | "paid";

export type TransactionProps = {
  id?: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  description: string;
  amount: number;
  occurredAt: Date;
  status?: ExpenseStatus | null;
  paidAt?: Date | null;
  createdAt?: Date;
};

export class Transaction {
  public readonly id: string;
  public readonly userId: string;
  public readonly categoryId: string;
  public readonly type: TransactionType;
  public readonly description: string;
  public readonly amount: number;
  public readonly occurredAt: Date;
  public readonly status: ExpenseStatus | null;
  public readonly paidAt: Date | null;
  public readonly createdAt: Date;

  private constructor(props: Required<TransactionProps>) {
    this.id = props.id;
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.type = props.type;
    this.description = props.description;
    this.amount = props.amount;
    this.occurredAt = props.occurredAt;
    this.status = props.status;
    this.paidAt = props.paidAt;
    this.createdAt = props.createdAt;
  }

  public static create(props: TransactionProps): Transaction {
    if (props.amount <= 0) {
      throw new Error("Transaction amount must be greater than zero.");     }

    return new Transaction({
      id: props.id ?? crypto.randomUUID(),
      userId: props.userId,
      categoryId: props.categoryId,
      type: props.type,
      description: props.description.trim(),
      amount: props.amount,
      occurredAt: props.occurredAt,
      status: props.type === "expense" ? "pending" : null,
      paidAt: null,
      createdAt: props.createdAt ?? new Date()
    });
  }

  public markAsPaid(paidAt?: Date): Transaction {
    if (this.type !== "expense") {
      throw new Error("Only expenses can be marked as paid.");
    }

    if (this.status === "paid") {
      throw new Error("Expense already paid.");
    }

    return new Transaction({
      id: this.id,
      userId: this.userId,
      categoryId: this.categoryId,
      type: this.type,
      description: this.description,
      amount: this.amount,
      occurredAt: this.occurredAt,
      status: "paid",
      paidAt: paidAt ?? new Date(),
      createdAt: this.createdAt
    });
  }
}
