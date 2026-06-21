import type { Response } from "express";

import type { AuthenticatedRequest } from "../../../../../shared/http/AuthenticatedRequest.js";
import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import { CategoryAlreadyExistsError } from "../../../application/errors/CategoryAlreadyExistsError.js";
import type { CreateCategoryUseCase } from "../../../application/use-cases/CreateCategoryUseCase.js";

export class CreateCategoryController {
  constructor(private readonly createCategoryUseCase: CreateCategoryUseCase) {}

  public handle = async (request: AuthenticatedRequest, response: Response): Promise<Response> => {
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
    } catch (error) {
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
