import { Response } from 'express';
import { z } from 'zod';
import { BodyWeightLog } from '../models/BodyWeightLog';
import { AuthRequest } from '../types';

const bodyWeightSchema = z.object({
  recordedAt: z.string(),
  weightKg: z.number().min(20).max(500),
});

export const getBodyWeightLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { from, to, limit = '90' } = req.query;
  const filter: Record<string, unknown> = { userId: req.userId };

  if (from || to) {
    filter.recordedAt = {};
    if (from) (filter.recordedAt as Record<string, unknown>).$gte = new Date(from as string);
    if (to) (filter.recordedAt as Record<string, unknown>).$lte = new Date(to as string);
  }

  const logs = await BodyWeightLog.find(filter)
    .sort({ recordedAt: -1 })
    .limit(parseInt(limit as string));

  res.json(logs.reverse());
};

export const createBodyWeightLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = bodyWeightSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  const log = await BodyWeightLog.create({ ...parsed.data, userId: req.userId });
  res.status(201).json(log);
};

export const deleteBodyWeightLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = await BodyWeightLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!log) {
    res.status(404).json({ message: 'Log not found' });
    return;
  }
  res.json({ message: 'Log deleted' });
};
