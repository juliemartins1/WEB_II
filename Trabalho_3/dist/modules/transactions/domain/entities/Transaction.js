import crypto from "node:crypto";
export class Transaction {
    id;
    userId;
    categoryId;
    type;
    description;
    amount;
    occurredAt;
    status;
    paidAt;
    createdAt;
    constructor(props) {
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
    static create(props) {
        if (props.amount <= 0) {
            throw new Error("Transaction amount must be greater than zero.");
        }
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
    markAsPaid(paidAt) {
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
