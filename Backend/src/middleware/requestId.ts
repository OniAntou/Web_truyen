import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

export default function requestId(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.header("x-request-id")?.trim();
  const id = incomingId && incomingId.length <= 128 ? incomingId : randomUUID();

  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}
