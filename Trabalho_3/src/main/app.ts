import express from "express";

import { makeDependencies } from "./container.js";
import { createRoutes } from "./routes.js";

export const createApp = () => {
  const app = express();
  const dependencies = makeDependencies();

  app.use(express.json());
  app.use(createRoutes(dependencies));

  return app;
};
