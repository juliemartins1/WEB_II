import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import { CategoryAlreadyExistsError } from "../../../application/errors/CategoryAlreadyExistsError.js";
export class CreateCategoryController {
    createCategoryUseCase;
    constructor(createCategoryUseCase) {
        this.createCategoryUseCase = createCategoryUseCase;
    }
    handle = async (request, response) => {
        try {
            const category = await this.createCategoryUseCase.execute({
                userId: request.auth.userId,
                name: request.body.name,
                kind: request.body.kind
            });
            return response.status(201).json({
                id: category.id,
                userId: category.userId,
                name: category.name,
                kind: category.kind,
                createdAt: category.createdAt
            });
        }
        catch (error) {
            if (error instanceof CategoryAlreadyExistsError) {
                return response.status(409).json({ message: error.message });
            }
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
