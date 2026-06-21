import type { Response } from "express";

import type { AuthenticatedRequest } from "../../../../../shared/http/AuthenticatedRequest.js";
import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import type { ListCategoriesUseCase } from "../../../application/use-cases/ListCategoriesUseCase.js";

export class ListCategoriesController {
  constructor(private readonly listCategoriesUseCase: ListCategoriesUseCase) {}

  public handle = async (request: AuthenticatedRequest, response: Response): Promise<Response> => {
    try {
      const categories = await this.listCategoriesUseCase.execute(request.auth.userId);

      return response.status(200).json(categories);
    } catch (error) {
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
