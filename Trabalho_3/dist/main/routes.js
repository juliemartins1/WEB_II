import { Router } from "express";
export const createRoutes = (dependencies) => {
    const router = Router();
    const handle = (controllerHandle) => {
        return controllerHandle;
    };
    router.get("/health", (_request, response) => {
        return response.status(200).json({ status: "ok" });
    });
    router.post("/auth/register", handle(dependencies.registerUserController.handle));
    router.post("/auth/login", handle(dependencies.loginController.handle));
    router.use(handle(dependencies.ensureAuthenticatedMiddleware.handle));
    router.post("/categories", handle(dependencies.createCategoryController.handle));
    router.get("/categories", handle(dependencies.listCategoriesController.handle));
    router.post("/transactions", handle(dependencies.createTransactionController.handle));
    router.get("/transactions", handle(dependencies.listTransactionsController.handle));
    router.patch("/transactions/:id/pay", handle(dependencies.markExpenseAsPaidController.handle));
    router.get("/reports/monthly-balance", handle(dependencies.getMonthlyBalanceController.handle));
    router.get("/reports/category-summary", handle(dependencies.getCategorySummaryController.handle));
    return router;
};
