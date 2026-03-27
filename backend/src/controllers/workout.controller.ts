import { Response } from 'express';
import { z } from 'zod';
import { WorkoutLog } from '../models/WorkoutLog';
import { AuthRequest } from '../types';

const setSchema = z.object({
  reps: z.number().min(0).optional(),
  weightKg: z.number().min(0).optional(),
  durationSeconds: z.number().min(0).optional(),
  distanceMeters: z.number().min(0).optional(),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1),
  exerciseNameSnapshot: z.string().min(1),
  measurementType: z.enum(['reps', 'duration', 'distance']),
  sets: z.array(setSchema).min(1),
});

const workoutSchema = z.object({
  workoutDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  durationMinutes: z.number().min(1).max(600).optional(),
  workoutType: z.enum(['push', 'pull', 'legs', 'core', 'full body', 'custom']),
  notes: z.string().max(1000).optional(),
  perceivedEffort: z.number().min(1).max(10).optional(),
  exercises: z.array(exerciseEntrySchema).min(1),
});

export const getWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', from, to } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const filter: Record<string, unknown> = { userId: req.userId };
  if (from || to) {
    filter.workoutDate = {};
    if (from) (filter.workoutDate as Record<string, unknown>).$gte = new Date(from as string);
    if (to) (filter.workoutDate as Record<string, unknown>).$lte = new Date(to as string);
  }

  const [workouts, total] = await Promise.all([
    WorkoutLog.find(filter)
      .sort({ workoutDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    WorkoutLog.countDocuments(filter),
  ]);

  res.json({ workouts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

export const getWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  const workout = await WorkoutLog.findOne({ _id: req.params.id, userId: req.userId });
  if (!workout) {
    res.status(404).json({ message: 'Workout not found' });
    return;
  }
  res.json(workout);
};

export const createWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = workoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  const workout = await WorkoutLog.create({ ...parsed.data, userId: req.userId });
  res.status(201).json(workout);
};

export const updateWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  const workout = await WorkoutLog.findOne({ _id: req.params.id, userId: req.userId });
  if (!workout) {
    res.status(404).json({ message: 'Workout not found' });
    return;
  }

  const parsed = workoutSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  Object.assign(workout, parsed.data);
  await workout.save();
  res.json(workout);
};

export const deleteWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  const workout = await WorkoutLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!workout) {
    res.status(404).json({ message: 'Workout not found' });
    return;
  }
  res.json({ message: 'Workout deleted' });
};
