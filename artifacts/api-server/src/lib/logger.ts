import pino from "pino";
import { randomUUID } from "crypto";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),

  // Protect sensitive data globally
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.set-cookie",
      "password",
      "passwordHash",
      "req.body.password",
    ],
    remove: true,
  },

  base: {
    env: process.env.NODE_ENV,
    pid: process.pid,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
});

/**
 * Create a child logger with request context (VERY useful for debugging auth/login)
 */
export function createRequestLogger(reqId: string) {
  return logger.child({ reqId });
}

/**
 * Simple module loggers (clean separation)
 */
export const authLog = logger.child({ module: "auth" });
export const dbLog = logger.child({ module: "db" });
export const httpLog = logger.child({ module: "http" });

/**
 * Generate request ID
 */
export function generateReqId() {
  return randomUUID().slice(0, 8);
}