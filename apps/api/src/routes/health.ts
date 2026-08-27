import { Router } from "express";
import type { HealthResponse } from "@openpolitics/shared";
import { config } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  const payload: HealthResponse = {
    status: "ok",
    service: "api",
    version: config.version
  };

  response.json(payload);
});
