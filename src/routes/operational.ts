import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/** Liveness means the Node.js process can answer a request. */
router.get('/health/live', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/** Readiness means this API currently has a usable MongoDB connection. */
router.get('/health/ready', (_req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;
  res.status(isDatabaseReady ? 200 : 503).json({
    status: isDatabaseReady ? 'ok' : 'not_ready',
    database: isDatabaseReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

export default router;
