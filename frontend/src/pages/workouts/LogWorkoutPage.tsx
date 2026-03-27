import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateWorkout } from '../../hooks/useQueries';
import WorkoutForm, { WorkoutFormData } from '../../components/forms/WorkoutForm';

const toNum = (v: string | undefined) => v ? parseFloat(v) : undefined;

export default function LogWorkoutPage() {
  const navigate = useNavigate();
  const createMutation = useCreateWorkout();

  const onSubmit = async (data: WorkoutFormData) => {
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
    await createMutation.mutateAsync(payload);
    navigate('/workouts');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/workouts" className="flex items-center gap-1.5 text-muted hover:text-accent text-sm font-mono mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to workouts
      </Link>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide mb-6">Log Workout</h1>
      <WorkoutForm onSubmit={onSubmit} submitLabel="Save Workout" />
    </div>
  );
}
