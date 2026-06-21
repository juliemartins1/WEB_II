import type { Response } from "express";

import type { AuthenticatedRequest } from "../../../../../shared/http/AuthenticatedRequest.js";
import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import { ExpenseAlreadyPaidError } from "../../../application/errors/ExpenseAlreadyPaidError.js";
import { TransactionNotFoundError } from "../../../application/errors/TransactionNotFoundError.js";
import type { MarkExpenseAsPaidUseCase } from "../../../application/use-cases/MarkExpenseAsPaidUseCase.js";

export class MarkExpenseAsPaidController {
  constructor(private readonly markExpenseAsPaidUseCase: MarkExpenseAsPaidUseCase) {}

  public handle = async (request: AuthenticatedRequest, response: Response): Promise<Response> => {
    try {
      const transaction = await this.markExpenseAsPaidUseCase.execute({
        userId: request.auth.userId,
        transactionId: request.params.id,
        paidAt: request.body.paidAt ? new Date(request.body.paidAt) : undefined
      });

      return response.status(200).json(transaction);
    } catch (error) {
      if (error instanceof TransactionNotFoundError) {
        return response.status(404).json({ message: error.message });
      }

      if (error instanceof ExpenseAlreadyPaidError) {
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
