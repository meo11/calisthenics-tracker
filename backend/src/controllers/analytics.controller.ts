import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  getDashboardSummary,
  getPersonalBests,
  getWorkoutsPerWeek,
  getGoalProgress,
  getExerciseProgress,
  calculateStreaks,
} from '../services/analytics.service';

export const dashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const summary = await getDashboardSummary(req.userId!);
  res.json(summary);
};

export const personalBests = async (req: AuthRequest, res: Response): Promise<void> => {
  const pbs = await getPersonalBests(req.userId!);
  res.json(pbs);
};

export const workoutsPerWeek = async (req: AuthRequest, res: Response): Promise<void> => {
  const weeks = parseInt(req.query.weeks as string) || 12;
  const data = await getWorkoutsPerWeek(req.userId!, weeks);
  res.json(data);
};

export const goalProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = await getGoalProgress(req.userId!);
  res.json(data);
};

export const exerciseProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { exerciseId } = req.params;
  const data = await getExerciseProgress(req.userId!, exerciseId);
  res.json(data);
};

export const streaks = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = await calculateStreaks(req.userId!);
  res.json(data);
};
