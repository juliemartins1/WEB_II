export class InMemoryCategoryRepository {
    categories = [];
    async findById(id) {
        return this.categories.find(c => c.id === id) ?? null;
    }
    async findByUserIdAndName(userId, name) {
        return (this.categories.find(c => c.userId === userId &&
            c.name.toLowerCase() === name.toLowerCase()) ?? null);
    }
    async listByUserId(userId) {
        return this.categories.filter(c => c.userId === userId);
    }
    async create(category) {
        this.categories.push(category);
    }
}
