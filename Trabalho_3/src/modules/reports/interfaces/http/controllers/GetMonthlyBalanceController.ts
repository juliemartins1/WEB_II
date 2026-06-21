import type { Response } from "express";

import type { AuthenticatedRequest } from "../../../../../shared/http/AuthenticatedRequest.js";
import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import type { GetMonthlyBalanceUseCase } from "../../../application/use-cases/GetMonthlyBalanceUseCase.js";

export class GetMonthlyBalanceController {
  constructor(private readonly getMonthlyBalanceUseCase: GetMonthlyBalanceUseCase) {}

  public handle = async (request: AuthenticatedRequest, response: Response): Promise<Response> => {
    try {
      const report = await this.getMonthlyBalanceUseCase.execute({
        userId: request.auth.userId,
        month: Number(request.query.month),
        year: Number(request.query.year)
      });

      return response.status(200).json(report);
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
