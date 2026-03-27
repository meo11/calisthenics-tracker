import api from './client';
import type {
  User, Exercise, WorkoutLog, BodyWeightLog, Goal,
  DashboardSummary, PersonalBest, WorkoutsPerWeek, GoalProgress, StreakData
} from '../types';

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string; heightCm?: number }) =>
    api.post<{ token: string; user: User }>('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data).then(r => r.data),
  me: () => api.get<User>('/auth/me').then(r => r.data),
  updateProfile: (data: { name?: string; heightCm?: number }) =>
    api.patch<User>('/auth/me', data).then(r => r.data),
};

// Exercises
export const exerciseApi = {
  list: () => api.get<Exercise[]>('/exercises').then(r => r.data),
  create: (data: Partial<Exercise>) => api.post<Exercise>('/exercises', data).then(r => r.data),
  update: (id: string, data: Partial<Exercise>) =>
    api.patch<Exercise>(`/exercises/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/exercises/${id}`).then(r => r.data),
};

// Workouts
export const workoutApi = {
  list: (params?: { page?: number; limit?: number; from?: string; to?: string }) =>
    api.get<{ workouts: WorkoutLog[]; total: number; page: number; pages: number }>('/workouts', { params }).then(r => r.data),
  get: (id: string) => api.get<WorkoutLog>(`/workouts/${id}`).then(r => r.data),
  create: (data: Partial<WorkoutLog>) => api.post<WorkoutLog>('/workouts', data).then(r => r.data),
  update: (id: string, data: Partial<WorkoutLog>) =>
    api.patch<WorkoutLog>(`/workouts/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/workouts/${id}`).then(r => r.data),
};

// Body weight
export const bodyweightApi = {
  list: (params?: { from?: string; to?: string; limit?: number }) =>
    api.get<BodyWeightLog[]>('/bodyweight', { params }).then(r => r.data),
  create: (data: { recordedAt: string; weightKg: number }) =>
    api.post<BodyWeightLog>('/bodyweight', data).then(r => r.data),
  delete: (id: string) => api.delete(`/bodyweight/${id}`).then(r => r.data),
};

// Goals
export const goalApi = {
  list: (status?: string) =>
    api.get<Goal[]>('/goals', { params: status ? { status } : {} }).then(r => r.data),
  create: (data: Partial<Goal>) => api.post<Goal>('/goals', data).then(r => r.data),
  update: (id: string, data: Partial<Goal>) =>
    api.patch<Goal>(`/goals/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/goals/${id}`).then(r => r.data),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get<DashboardSummary>('/analytics/dashboard').then(r => r.data),
  personalBests: () => api.get<PersonalBest[]>('/analytics/personal-bests').then(r => r.data),
  workoutsPerWeek: (weeks?: number) =>
    api.get<WorkoutsPerWeek[]>('/analytics/workouts-per-week', { params: { weeks } }).then(r => r.data),
  goalProgress: () => api.get<GoalProgress[]>('/analytics/goal-progress').then(r => r.data),
  exerciseProgress: (exerciseId: string) =>
    api.get(`/analytics/exercise-progress/${exerciseId}`).then(r => r.data),
  streaks: () => api.get<StreakData>('/analytics/streaks').then(r => r.data),
};
