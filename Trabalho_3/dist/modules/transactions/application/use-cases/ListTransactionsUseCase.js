export class ListTransactionsUseCase {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async execute(input) {
        return this.transactionRepository.listByUserId(input.userId, input.filters);
    }
}
