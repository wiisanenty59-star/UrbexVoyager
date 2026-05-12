import { Request, Response, NextFunction } from "express";
import { createRequestLogger, generateReqId } from "../lib/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const reqId = generateReqId();
  const log = createRequestLogger(reqId);

  const start = Date.now();

  // attach to request so you can use it anywhere
  (req as any).reqId = reqId;
  (req as any).log = log;

  log.info(
    {
      method: req.method,
      url: req.url,
    },
    "incoming request"
  );

  res.on("finish", () => {
    const ms = Date.now() - start;

    log.info(
      {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        durationMs: ms,
      },
      "request completed"
    );
  });

  next();
}