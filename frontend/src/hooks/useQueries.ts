import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, exerciseApi, workoutApi, bodyweightApi, goalApi } from '../api';

// Analytics
export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: analyticsApi.dashboard });

export const useStreaks = () =>
  useQuery({ queryKey: ['streaks'], queryFn: analyticsApi.streaks });

export const usePersonalBests = () =>
  useQuery({ queryKey: ['personalBests'], queryFn: analyticsApi.personalBests });

export const useWorkoutsPerWeek = (weeks = 12) =>
  useQuery({ queryKey: ['workoutsPerWeek', weeks], queryFn: () => analyticsApi.workoutsPerWeek(weeks) });

export const useGoalProgress = () =>
  useQuery({ queryKey: ['goalProgress'], queryFn: analyticsApi.goalProgress });

export const useExerciseProgress = (exerciseId: string) =>
  useQuery({
    queryKey: ['exerciseProgress', exerciseId],
    queryFn: () => analyticsApi.exerciseProgress(exerciseId),
    enabled: !!exerciseId,
  });

// Exercises
export const useExercises = () =>
  useQuery({ queryKey: ['exercises'], queryFn: exerciseApi.list });

export const useCreateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: exerciseApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  });
};

export const useUpdateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => exerciseApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  });
};

export const useDeleteExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: exerciseApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  });
};

// Workouts
export const useWorkouts = (params?: { page?: number; limit?: number; from?: string; to?: string }) =>
  useQuery({ queryKey: ['workouts', params], queryFn: () => workoutApi.list(params) });

export const useWorkout = (id: string) =>
  useQuery({ queryKey: ['workout', id], queryFn: () => workoutApi.get(id), enabled: !!id });

export const useCreateWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workoutApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
};

export const useUpdateWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => workoutApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['workout', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workoutApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Body weight
export const useBodyWeight = (params?: { limit?: number }) =>
  useQuery({ queryKey: ['bodyweight', params], queryFn: () => bodyweightApi.list(params) });

export const useCreateBodyWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bodyweightApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bodyweight'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteBodyWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bodyweightApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bodyweight'] }),
  });
};

// Goals
export const useGoals = (status?: string) =>
  useQuery({ queryKey: ['goals', status], queryFn: () => goalApi.list(status) });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['goalProgress'] });
    },
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => goalApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['goalProgress'] });
    },
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
};
