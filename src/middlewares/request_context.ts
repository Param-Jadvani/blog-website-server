import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** Adds one safe identifier to every request so related log entries can be found. */
const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const incomingId = req.header('x-request-id');
  req.requestId =
    incomingId && incomingId.length <= 128 ? incomingId : randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

export default requestContext;
