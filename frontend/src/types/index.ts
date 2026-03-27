export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'mobility' | 'skill';
export type MeasurementType = 'reps' | 'duration' | 'distance';
export type GoalType = 'reps' | 'sets' | 'weight' | 'duration' | 'milestone';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type WorkoutType = 'push' | 'pull' | 'legs' | 'core' | 'full body' | 'custom';

export interface User {
  id: string;
  email: string;
  name: string;
  heightCm?: number;
}

export interface Exercise {
  _id: string;
  name: string;
  category: ExerciseCategory;
  measurementType: MeasurementType;
  isDefault: boolean;
  createdByUserId?: string;
  createdAt: string;
}

export interface SetData {
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseNameSnapshot: string;
  measurementType: MeasurementType;
  sets: SetData[];
}

export interface WorkoutLog {
  _id: string;
  userId: string;
  workoutDate: string;
  durationMinutes?: number;
  workoutType: WorkoutType;
  notes?: string;
  perceivedEffort?: number;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface BodyWeightLog {
  _id: string;
  userId: string;
  recordedAt: string;
  weightKg: number;
  createdAt: string;
}

export interface Goal {
  _id: string;
  userId: string;
  exerciseId: { _id: string; name: string; category: ExerciseCategory } | string;
  goalType: GoalType;
  targetValue: number;
  targetSets?: number;
  notes?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}

export interface PersonalBest {
  exerciseId: string;
  exerciseName: string;
  maxReps?: number;
  maxWeightKg?: number;
  maxDurationSeconds?: number;
  achievedAt: string;
}

export interface WorkoutsPerWeek {
  week: string;
  count: number;
}

export interface GoalProgress {
  goalId: string;
  exerciseName: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
  status: string;
}

export interface DashboardSummary {
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  recentWorkouts: WorkoutLog[];
  latestWeight?: number;
  streaks: StreakData;
  activeGoals: number;
}
