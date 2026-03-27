import { Response } from 'express';
import { z } from 'zod';
import { Goal } from '../models/Goal';
import { AuthRequest } from '../types';

const goalSchema = z.object({
  exerciseId: z.string().min(1),
  goalType: z.enum(['reps', 'sets', 'weight', 'duration', 'milestone']),
  targetValue: z.number().min(0),
  targetSets: z.number().min(1).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  const filter: Record<string, unknown> = { userId: req.userId };
  if (status) filter.status = status;

  const goals = await Goal.find(filter).populate('exerciseId', 'name category').sort({ createdAt: -1 });
  res.json(goals);
};

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  const goal = await Goal.create({ ...parsed.data, userId: req.userId, status: 'active' });
  await goal.populate('exerciseId', 'name category');
  res.status(201).json(goal);
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
  if (!goal) {
    res.status(404).json({ message: 'Goal not found' });
    return;
  }

  const parsed = goalSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  Object.assign(goal, parsed.data);
  await goal.save();
  await goal.populate('exerciseId', 'name category');
  res.json(goal);
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!goal) {
    res.status(404).json({ message: 'Goal not found' });
    return;
  }
  res.json({ message: 'Goal deleted' });
};
