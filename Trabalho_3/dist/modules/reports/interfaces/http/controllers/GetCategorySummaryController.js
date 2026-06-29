import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
export class GetCategorySummaryController {
    getCategorySummaryUseCase;
    constructor(getCategorySummaryUseCase) {
        this.getCategorySummaryUseCase = getCategorySummaryUseCase;
    }
    handle = async (request, response) => {
        try {
            const report = await this.getCategorySummaryUseCase.execute({
                userId: request.auth.userId,
                month: Number(request.query.month),
                year: Number(request.query.year)
            });
            return response.status(200).json(report);
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
