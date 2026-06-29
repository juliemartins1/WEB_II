export class InMemoryUserRepository {
    users = [];
    async findById(id) {
        return this.users.find((user) => user.id === id) ?? null;
    }
    async findByEmail(email) {
        const normalizedEmail = email.trim().toLowerCase();
        return this.users.find((user) => user.email === normalizedEmail) ?? null;
    }
    async create(user) {
        this.users.push(user);
    }
}
