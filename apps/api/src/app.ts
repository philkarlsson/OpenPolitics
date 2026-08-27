import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config.js";
import { errorHandler } from "./http/errors.js";
import { geographyRouter } from "./routes/geography.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.webOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ level: process.env.NODE_ENV === "test" ? "silent" : "info" }));

  app.use("/health", healthRouter);
  app.use("/v1/geography", geographyRouter);
  app.use("/v1/me", meRouter);

  app.use(errorHandler);

  return app;
}
