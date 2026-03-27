import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWorkout, useUpdateWorkout } from '../../hooks/useQueries';
import WorkoutForm, { WorkoutFormData } from '../../components/forms/WorkoutForm';
import { LoadingState } from '../../components/ui';

const toStr = (v: number | undefined) => v != null ? String(v) : undefined;

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading } = useWorkout(id!);
  const updateMutation = useUpdateWorkout();

  if (isLoading) return <LoadingState />;
  if (!workout) return <div className="text-muted font-mono">Workout not found.</div>;

  const defaultValues: Partial<WorkoutFormData> = {
    workoutDate: workout.workoutDate.split('T')[0],
    workoutType: workout.workoutType,
    durationMinutes: toStr(workout.durationMinutes),
    perceivedEffort: toStr(workout.perceivedEffort),
    notes: workout.notes,
    exercises: workout.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseNameSnapshot: ex.exerciseNameSnapshot,
      measurementType: ex.measurementType,
      sets: ex.sets.map(s => ({
        reps: toStr(s.reps),
        weightKg: toStr(s.weightKg),
        durationSeconds: toStr(s.durationSeconds),
        distanceMeters: toStr(s.distanceMeters),
      })),
    })),
  };

  const onSubmit = async (data: WorkoutFormData) => {
    const toNum = (v: string | undefined) => v ? parseFloat(v) : undefined;
    const payload = {
      workoutDate: new Date(data.workoutDate).toISOString(),
      workoutType: data.workoutType,
      durationMinutes: toNum(data.durationMinutes),
      perceivedEffort: toNum(data.perceivedEffort),
      notes: data.notes,
      exercises: data.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseNameSnapshot: ex.exerciseNameSnapshot,
        measurementType: ex.measurementType,
        sets: ex.sets.map(s => ({
          reps: toNum(s.reps),
          weightKg: toNum(s.weightKg),
          durationSeconds: toNum(s.durationSeconds),
          distanceMeters: toNum(s.distanceMeters),
        })),
      })),
    };
    await updateMutation.mutateAsync({ id: id!, data: payload });
    navigate('/workouts');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/workouts" className="flex items-center gap-1.5 text-muted hover:text-accent text-sm font-mono mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to workouts
      </Link>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide mb-6">Edit Workout</h1>
      <WorkoutForm defaultValues={defaultValues} onSubmit={onSubmit} submitLabel="Update Workout" />
    </div>
  );
}
