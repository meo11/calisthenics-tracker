import { Types } from 'mongoose';
import { WorkoutLog } from '../models/WorkoutLog';
import { BodyWeightLog } from '../models/BodyWeightLog';
import { Goal } from '../models/Goal';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
}

export interface PersonalBest {
  exerciseId: string;
  exerciseName: string;
  maxReps?: number;
  maxWeightKg?: number;
  maxDurationSeconds?: number;
  achievedAt: Date;
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

export const calculateStreaks = async (userId: string): Promise<StreakData> => {
  const workouts = await WorkoutLog.find({ userId })
    .select('workoutDate')
    .sort({ workoutDate: -1 });

  if (workouts.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
  }

  // Deduplicate by date
  const dates = [...new Set(workouts.map(w => {
    const d = new Date(w.workoutDate);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }))].sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if streak is still alive
  const mostRecent = new Date(dates[0]);
  if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
    currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate: workouts[0].workoutDate,
  };
};

export const getPersonalBests = async (userId: string): Promise<PersonalBest[]> => {
  const workouts = await WorkoutLog.find({ userId });
  const pbMap = new Map<string, PersonalBest>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const key = exercise.exerciseId.toString();
      const existing = pbMap.get(key);

      let maxReps = 0;
      let maxWeight = 0;
      let maxDuration = 0;

      for (const set of exercise.sets) {
        if (set.reps) maxReps = Math.max(maxReps, set.reps);
        if (set.weightKg) maxWeight = Math.max(maxWeight, set.weightKg);
        if (set.durationSeconds) maxDuration = Math.max(maxDuration, set.durationSeconds);
      }

      const isNewPB =
        !existing ||
        maxReps > (existing.maxReps || 0) ||
        maxWeight > (existing.maxWeightKg || 0) ||
        maxDuration > (existing.maxDurationSeconds || 0);

      if (isNewPB) {
        pbMap.set(key, {
          exerciseId: key,
          exerciseName: exercise.exerciseNameSnapshot,
          maxReps: maxReps || undefined,
          maxWeightKg: maxWeight || undefined,
          maxDurationSeconds: maxDuration || undefined,
          achievedAt: workout.workoutDate,
        });
      }
    }
  }

  return Array.from(pbMap.values());
};

export const getWorkoutsPerWeek = async (userId: string, weeks = 12): Promise<WorkoutsPerWeek[]> => {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const workouts = await WorkoutLog.find({ userId, workoutDate: { $gte: since } })
    .select('workoutDate');

  const weekMap = new Map<string, number>();

  for (const w of workouts) {
    const d = new Date(w.workoutDate);
    // Get Monday of that week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const key = monday.toISOString().split('T')[0];
    weekMap.set(key, (weekMap.get(key) || 0) + 1);
  }

  // Fill in missing weeks
  const result: WorkoutsPerWeek[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) - i * 7;
    const monday = new Date(d.setDate(diff));
    const key = monday.toISOString().split('T')[0];
    result.push({ week: key, count: weekMap.get(key) || 0 });
  }

  return result;
};

export const getGoalProgress = async (userId: string): Promise<GoalProgress[]> => {
  const goals = await Goal.find({ userId, status: 'active' }).populate('exerciseId', 'name');
  const workouts = await WorkoutLog.find({ userId });

  return goals.map(goal => {
    const exercise = goal.exerciseId as unknown as { _id: Types.ObjectId; name: string };
    let currentValue = 0;

    for (const workout of workouts) {
      for (const ex of workout.exercises) {
        if (ex.exerciseId.toString() !== exercise._id.toString()) continue;

        if (goal.goalType === 'reps') {
          const maxReps = Math.max(...ex.sets.map(s => s.reps || 0));
          currentValue = Math.max(currentValue, maxReps);
        } else if (goal.goalType === 'sets') {
          currentValue = Math.max(currentValue, ex.sets.length);
        } else if (goal.goalType === 'weight') {
          const maxWeight = Math.max(...ex.sets.map(s => s.weightKg || 0));
          currentValue = Math.max(currentValue, maxWeight);
        } else if (goal.goalType === 'duration') {
          const maxDuration = Math.max(...ex.sets.map(s => s.durationSeconds || 0));
          currentValue = Math.max(currentValue, maxDuration);
        }
      }
    }

    const progressPercent = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));

    return {
      goalId: goal._id.toString(),
      exerciseName: exercise.name,
      goalType: goal.goalType,
      targetValue: goal.targetValue,
      currentValue,
      progressPercent,
      status: goal.status,
    };
  });
};

export const getExerciseProgress = async (userId: string, exerciseId: string) => {
  const workouts = await WorkoutLog.find({
    userId,
    'exercises.exerciseId': new Types.ObjectId(exerciseId),
  }).sort({ workoutDate: 1 });

  return workouts.map(w => {
    const ex = w.exercises.find(e => e.exerciseId.toString() === exerciseId);
    if (!ex) return null;

    const maxReps = Math.max(...ex.sets.map(s => s.reps || 0), 0);
    const totalVolume = ex.sets.reduce((sum, s) => sum + (s.reps || 0) * (s.weightKg || 1), 0);
    const maxDuration = Math.max(...ex.sets.map(s => s.durationSeconds || 0), 0);

    return {
      date: w.workoutDate,
      maxReps: maxReps || undefined,
      totalVolume: totalVolume || undefined,
      maxDuration: maxDuration || undefined,
      sets: ex.sets.length,
    };
  }).filter(Boolean);
};

export const getDashboardSummary = async (userId: string) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalWorkouts,
    workoutsThisWeek,
    workoutsThisMonth,
    recentWorkouts,
    latestWeight,
    streaks,
    activeGoals,
  ] = await Promise.all([
    WorkoutLog.countDocuments({ userId }),
    WorkoutLog.countDocuments({ userId, workoutDate: { $gte: sevenDaysAgo } }),
    WorkoutLog.countDocuments({ userId, workoutDate: { $gte: thirtyDaysAgo } }),
    WorkoutLog.find({ userId }).sort({ workoutDate: -1 }).limit(5),
    BodyWeightLog.findOne({ userId }).sort({ recordedAt: -1 }),
    calculateStreaks(userId),
    Goal.countDocuments({ userId, status: 'active' }),
  ]);

  return {
    totalWorkouts,
    workoutsThisWeek,
    workoutsThisMonth,
    recentWorkouts,
    latestWeight: latestWeight?.weightKg,
    streaks,
    activeGoals,
  };
};
