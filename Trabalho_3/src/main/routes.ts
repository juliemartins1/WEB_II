import { Router } from "express";

import type { makeDependencies } from "./container.js";

type AppDependencies = ReturnType<typeof makeDependencies>;

export const createRoutes = (dependencies: AppDependencies): Router => {
  const router = Router();

  router.get("/health", (_request, response) => {
    return response.status(200).json({ status: "ok" });
  });

  router.post("/auth/register", dependencies.registerUserController.handle);
  router.post("/auth/login", dependencies.loginController.handle);

  router.use(dependencies.ensureAuthenticatedMiddleware.handle);

  router.post("/categories", dependencies.createCategoryController.handle);
  router.get("/categories", dependencies.listCategoriesController.handle);

  router.post("/transactions", dependencies.createTransactionController.handle);
  router.get("/transactions", dependencies.listTransactionsController.handle);
  router.patch("/transactions/:id/pay", dependencies.markExpenseAsPaidController.handle);

  router.get("/reports/monthly-balance", dependencies.getMonthlyBalanceController.handle);
  router.get("/reports/category-summary", dependencies.getCategorySummaryController.handle);

  return router;
};
