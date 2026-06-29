export class InMemoryTransactionRepository {
    transactions = [];
    async findById(id) {
        return this.transactions.find((transaction) => transaction.id === id) ?? null;
    }
    async listByUserId(userId, filters) {
        return this.transactions.filter((transaction) => {
            if (transaction.userId !== userId)
                return false;
            if (filters?.categoryId && transaction.categoryId !== filters.categoryId)
                return false;
            if (filters?.type && transaction.type !== filters.type)
                return false;
            if (filters?.month && transaction.occurredAt.getUTCMonth() + 1 !== filters.month)
                return false;
            if (filters?.year && transaction.occurredAt.getUTCFullYear() !== filters.year)
                return false;
            return true;
        });
    }
    async create(transaction) {
        this.transactions.push(transaction);
    }
    async update(transaction) {
        const index = this.transactions.findIndex((item) => item.id === transaction.id);
        if (index >= 0) {
            this.transactions[index] = transaction;
        }
    }
}
