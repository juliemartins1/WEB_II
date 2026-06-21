import { LoginUseCase } from "../modules/auth/application/use-cases/LoginUseCase.js";
import { RegisterUserUseCase } from "../modules/auth/application/use-cases/RegisterUserUseCase.js";
import { PlaceholderPasswordHasher } from "../modules/auth/infrastructure/services/PlaceholderPasswordHasher.js";
import { PlaceholderTokenService } from "../modules/auth/infrastructure/services/PlaceholderTokenService.js";
import { LoginController } from "../modules/auth/interfaces/http/controllers/LoginController.js";
import { RegisterUserController } from "../modules/auth/interfaces/http/controllers/RegisterUserController.js";
import { CreateCategoryUseCase } from "../modules/categories/application/use-cases/CreateCategoryUseCase.js";
import { ListCategoriesUseCase } from "../modules/categories/application/use-cases/ListCategoriesUseCase.js";
import { InMemoryCategoryRepository } from "../modules/categories/infrastructure/repositories/InMemoryCategoryRepository.js";
import { CreateCategoryController } from "../modules/categories/interfaces/http/controllers/CreateCategoryController.js";
import { ListCategoriesController } from "../modules/categories/interfaces/http/controllers/ListCategoriesController.js";
import { GetCategorySummaryUseCase } from "../modules/reports/application/use-cases/GetCategorySummaryUseCase.js";
import { GetMonthlyBalanceUseCase } from "../modules/reports/application/use-cases/GetMonthlyBalanceUseCase.js";
import { GetCategorySummaryController } from "../modules/reports/interfaces/http/controllers/GetCategorySummaryController.js";
import { GetMonthlyBalanceController } from "../modules/reports/interfaces/http/controllers/GetMonthlyBalanceController.js";
import { CreateTransactionUseCase } from "../modules/transactions/application/use-cases/CreateTransactionUseCase.js";
import { ListTransactionsUseCase } from "../modules/transactions/application/use-cases/ListTransactionsUseCase.js";
import { MarkExpenseAsPaidUseCase } from "../modules/transactions/application/use-cases/MarkExpenseAsPaidUseCase.js";
import { InMemoryTransactionRepository } from "../modules/transactions/infrastructure/repositories/InMemoryTransactionRepository.js";
import { CreateTransactionController } from "../modules/transactions/interfaces/http/controllers/CreateTransactionController.js";
import { ListTransactionsController } from "../modules/transactions/interfaces/http/controllers/ListTransactionsController.js";
import { MarkExpenseAsPaidController } from "../modules/transactions/interfaces/http/controllers/MarkExpenseAsPaidController.js";
import { InMemoryUserRepository } from "../modules/users/infrastructure/repositories/InMemoryUserRepository.js";
import { EnsureAuthenticatedMiddleware } from "../shared/http/middlewares/EnsureAuthenticatedMiddleware.js";

export const makeDependencies = () => {
  const userRepository = new InMemoryUserRepository();
  const categoryRepository = new InMemoryCategoryRepository();
  const transactionRepository = new InMemoryTransactionRepository();

  const passwordHasher = new PlaceholderPasswordHasher();
  const tokenService = new PlaceholderTokenService();

  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);
  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);

  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
  const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);

  const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository, categoryRepository);
  const listTransactionsUseCase = new ListTransactionsUseCase(transactionRepository);
  const markExpenseAsPaidUseCase = new MarkExpenseAsPaidUseCase(transactionRepository);

  const getMonthlyBalanceUseCase = new GetMonthlyBalanceUseCase(transactionRepository);
  const getCategorySummaryUseCase = new GetCategorySummaryUseCase(transactionRepository, categoryRepository);

  return {
    ensureAuthenticatedMiddleware: new EnsureAuthenticatedMiddleware(tokenService),
    registerUserController: new RegisterUserController(registerUserUseCase),
    loginController: new LoginController(loginUseCase),
    createCategoryController: new CreateCategoryController(createCategoryUseCase),
    listCategoriesController: new ListCategoriesController(listCategoriesUseCase),
    createTransactionController: new CreateTransactionController(createTransactionUseCase),
    listTransactionsController: new ListTransactionsController(listTransactionsUseCase),
    markExpenseAsPaidController: new MarkExpenseAsPaidController(markExpenseAsPaidUseCase),
    getMonthlyBalanceController: new GetMonthlyBalanceController(getMonthlyBalanceUseCase),
    getCategorySummaryController: new GetCategorySummaryController(getCategorySummaryUseCase)
  };
};
