import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import crypto from "node:crypto";

export type CategoryKind = "income" | "expense";

export type CategoryProps = {
  id?: string;
  userId: string;
  name: string;
  kind: CategoryKind;
  createdAt?: Date;
};

export class Category {
  public readonly id: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly kind: CategoryKind;
  public readonly createdAt: Date;

  private constructor(props: Required<CategoryProps>) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.kind = props.kind;
    this.createdAt = props.createdAt;
  }

  public static create(props: CategoryProps): Category {
    const name = props.name.trim();

    if (!name) {
      throw new Error("Category name is required.");
    }

    return new Category({
      id: props.id ?? crypto.randomUUID(),
      userId: props.userId,
      name,
      kind: props.kind,
      createdAt: props.createdAt ?? new Date()
    });
  }
}
