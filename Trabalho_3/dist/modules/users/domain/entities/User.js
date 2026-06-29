import crypto from "node:crypto";
export class User {
    id;
    name;
    email;
    passwordHash;
    createdAt;
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.passwordHash = props.passwordHash;
        this.createdAt = props.createdAt;
    }
    static create(props) {
        const name = props.name.trim();
        const email = props.email.trim().toLowerCase();
        if (!name) {
            throw new Error("User name is required.");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("A valid user email is required.");
        }
        if (!props.passwordHash) {
            throw new Error("Password hash is required.");
        }
        return new User({
            id: props.id ?? crypto.randomUUID(),
            name,
            email,
            passwordHash: props.passwordHash,
            createdAt: props.createdAt ?? new Date()
        });
    }
}
