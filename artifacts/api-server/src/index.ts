import app from "./app";
import { logger } from "./lib/logger";
import "dotenv/config";

const rawPort = process.env.PORT ?? "3000";
const nodeEnv = process.env.NODE_ENV ?? "development";

/**
 * =========================
 * BOOT LOG
 * =========================
 */
logger.info(
  {
    nodeEnv,
    port: rawPort,
  },
  "Booting server",
);

/**
 * =========================
 * PORT VALIDATION
 * =========================
 */
const port = Number(rawPort);

if (!Number.isFinite(port) || port <= 0) {
  logger.error({ rawPort }, "Invalid PORT value");
  throw new Error(`Invalid PORT value: ${rawPort}`);
}

/**
 * =========================
 * START SERVER
 * =========================
 */
const server = app.listen(port, "0.0.0.0", () => {
  logger.info(
    {
      port,
      env: nodeEnv,
    },
    "🚀 API server running",
  );

  console.log(`🚀 Server listening on http://localhost:${port}`);
});

/**
 * =========================
 * ERROR HANDLING
 * =========================
 */
server.on("error", (err: NodeJS.ErrnoException) => {
  logger.error(
    {
      err,
      code: err.code,
    },
    "Fatal server listen error",
  );

  process.exit(1);
});

/**
 * =========================
 * GLOBAL SAFETY
 * =========================
 */
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Promise Rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
  process.exit(1);
});