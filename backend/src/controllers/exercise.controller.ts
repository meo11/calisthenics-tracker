import { Response } from 'express';
import { z } from 'zod';
import { Exercise } from '../models/Exercise';
import { AuthRequest } from '../types';

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['push', 'pull', 'legs', 'core', 'cardio', 'mobility', 'skill']),
  measurementType: z.enum(['reps', 'duration', 'distance']),
});

export const getExercises = async (req: AuthRequest, res: Response): Promise<void> => {
  const exercises = await Exercise.find({
    $or: [{ isDefault: true }, { createdByUserId: req.userId }],
  }).sort({ isDefault: -1, name: 1 });
  res.json(exercises);
};

export const createExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = exerciseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  const exercise = await Exercise.create({
    ...parsed.data,
    isDefault: false,
    createdByUserId: req.userId,
  });
  res.status(201).json(exercise);
};

export const updateExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  const exercise = await Exercise.findOne({ _id: req.params.id, createdByUserId: req.userId });
  if (!exercise) {
    res.status(404).json({ message: 'Exercise not found or not editable' });
    return;
  }

  const parsed = exerciseSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  Object.assign(exercise, parsed.data);
  await exercise.save();
  res.json(exercise);
};

export const deleteExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  const exercise = await Exercise.findOneAndDelete({ _id: req.params.id, createdByUserId: req.userId });
  if (!exercise) {
    res.status(404).json({ message: 'Exercise not found or not deletable' });
    return;
  }
  res.json({ message: 'Exercise deleted' });
};
