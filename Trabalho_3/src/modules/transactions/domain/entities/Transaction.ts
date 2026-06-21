import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

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

  public static create(_props: TransactionProps): Transaction {
    throw new NotImplementedError("Implement transaction creation and validation rules.");
  }

  public markAsPaid(_paidAt?: Date): Transaction {
    throw new NotImplementedError("Implement expense payment transition.");
  }
}
