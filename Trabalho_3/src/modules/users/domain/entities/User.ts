import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import crypto from "node:crypto";

export type UserProps = {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
};

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly createdAt: Date;

  private constructor(props: Required<UserProps>) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
  }
  public static create(props: UserProps): User {
    const name = props.name.trim();
    const email = props.email.trim().toLowerCase();

    if (!name) {
      throw new Error("User name is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new Error("A valid user email is required.");
    }
  }
  
}
