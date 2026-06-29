import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
export class ListCategoriesController {
    listCategoriesUseCase;
    constructor(listCategoriesUseCase) {
        this.listCategoriesUseCase = listCategoriesUseCase;
    }
    handle = async (request, response) => {
        try {
            const categories = await this.listCategoriesUseCase.execute(request.auth.userId);
            return response.status(200).json(categories);
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
