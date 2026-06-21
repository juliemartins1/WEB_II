import type { Response } from "express";

import type { AuthenticatedRequest } from "../../../../../shared/http/AuthenticatedRequest.js";
import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import { CategoryNotFoundError } from "../../../application/errors/CategoryNotFoundError.js";
import type { CreateTransactionUseCase } from "../../../application/use-cases/CreateTransactionUseCase.js";

export class CreateTransactionController {
  constructor(private readonly createTransactionUseCase: CreateTransactionUseCase) {}

  public handle = async (request: AuthenticatedRequest, response: Response): Promise<Response> => {
    try {
      const transaction = await this.createTransactionUseCase.execute({
        userId: request.auth.userId,
        categoryId: request.body.categoryId,
        type: request.body.type,
        description: request.body.description,
        amount: Number(request.body.amount),
        occurredAt: new Date(request.body.occurredAt)
      });

      return response.status(201).json({
        id: transaction.id,
        userId: transaction.userId,
        categoryId: transaction.categoryId,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        occurredAt: transaction.occurredAt,
        status: transaction.status,
        paidAt: transaction.paidAt,
        createdAt: transaction.createdAt
      });
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return response.status(404).json({ message: error.message });
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
