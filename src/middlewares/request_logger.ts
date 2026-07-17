import type { NextFunction, Request, Response } from 'express';
import { logger } from '@/lib/winston';

/** Logs one structured, secret-free summary after Express has sent a response. */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info('HTTP request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      userId: req.userId?.toString(),
    });
  });

  next();
};

export default requestLogger;
