import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
export class ListTransactionsController {
    listTransactionsUseCase;
    constructor(listTransactionsUseCase) {
        this.listTransactionsUseCase = listTransactionsUseCase;
    }
    handle = async (request, response) => {
        try {
            const transactions = await this.listTransactionsUseCase.execute({
                userId: request.auth.userId,
                filters: {
                    month: request.query.month ? Number(request.query.month) : undefined,
                    year: request.query.year ? Number(request.query.year) : undefined,
                    categoryId: request.query.categoryId ? String(request.query.categoryId) : undefined,
                    type: request.query.type ? String(request.query.type) : undefined
                }
            });
            return response.status(200).json(transactions);
        }
        catch (error) {
            if (error instanceof NotImplementedError) {
                return response.status(500).json({ message: error.message });
            }
            if (error instanceof Error) {
                return response.status(400).json({ message: error.message });
            }
            return response.status(500).json({ message: "Unexpected error." });
        }
    };
}
