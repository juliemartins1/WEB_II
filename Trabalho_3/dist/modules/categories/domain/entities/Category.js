import crypto from "node:crypto";
export class Category {
    id;
    userId;
    name;
    kind;
    createdAt;
    constructor(props) {
        this.id = props.id;
        this.userId = props.userId;
        this.name = props.name;
        this.kind = props.kind;
        this.createdAt = props.createdAt;
    }
    static create(props) {
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
