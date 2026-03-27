import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
  userId?: string;
  body: Record<string, unknown>;
  query: Record<string, unknown>;
  params: Record<string, string>;
}

export type { Response, NextFunction };

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'mobility' | 'skill';
export type MeasurementType = 'reps' | 'duration' | 'distance';
export type GoalType = 'reps' | 'sets' | 'weight' | 'duration' | 'milestone';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type WorkoutType = 'push' | 'pull' | 'legs' | 'core' | 'full body' | 'custom';

export interface SetData {
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
}

export interface WorkoutExercise {
  exerciseId: Types.ObjectId;
  exerciseNameSnapshot: string;
  measurementType: MeasurementType;
  sets: SetData[];
}
