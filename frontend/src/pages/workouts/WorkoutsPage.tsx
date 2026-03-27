import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Dumbbell, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkouts, useDeleteWorkout } from '../../hooks/useQueries';
import { PageHeader, LoadingState, EmptyState, CategoryBadge, EffortIndicator } from '../../components/ui';

export default function WorkoutsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWorkouts({ page, limit: 15 });
  const deleteMutation = useDeleteWorkout();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workout?')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div>
      <PageHeader
        title="Workouts"
        subtitle="Your training history"
        action={
          <Link to="/workouts/new" className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Log Workout
          </Link>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : !data?.workouts.length ? (
        <div className="card">
          <EmptyState
            icon={Dumbbell}
            title="No workouts logged"
            description="Track your first session and start building your history."
            action={<Link to="/workouts/new" className="btn-primary">Log First Workout</Link>}
          />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.workouts.map((w, i) => (
              <div
                key={w._id}
                className={`card-hover animate-fade-up stagger-${Math.min(i + 1, 5)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="font-display text-2xl font-bold text-accent leading-none">
                      {format(new Date(w.workoutDate), 'd')}
                    </div>
                    <div className="font-mono text-xs text-muted uppercase tracking-wider">
                      {format(new Date(w.workoutDate), 'MMM')}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-border self-stretch" />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display font-bold text-lg uppercase tracking-wide text-textPrimary capitalize">
                        {w.workoutType}
                      </span>
                      <CategoryBadge category={w.workoutType} />
                      {w.perceivedEffort && (
                        <span className="font-mono text-xs text-muted">Effort {w.perceivedEffort}/10</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted font-mono flex-wrap mb-2">
                      <span>{format(new Date(w.workoutDate), 'EEEE')}</span>
                      {w.durationMinutes && <><span>·</span><span>{w.durationMinutes} min</span></>}
                      <span>·</span>
                      <span>{w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Exercises list */}
                    <div className="flex flex-wrap gap-1.5">
                      {w.exercises.slice(0, 5).map((ex, j) => (
                        <span key={j} className="font-mono text-xs bg-background border border-border px-2 py-0.5 rounded text-textSecondary">
                          {ex.exerciseNameSnapshot}
                        </span>
                      ))}
                      {w.exercises.length > 5 && (
                        <span className="font-mono text-xs text-muted px-2 py-0.5">
                          +{w.exercises.length - 5} more
                        </span>
                      )}
                    </div>

                    {w.notes && (
                      <p className="text-xs text-muted mt-2 italic truncate">{w.notes}</p>
                    )}
                  </div>

                  {/* Effort indicator */}
                  {w.perceivedEffort && (
                    <div className="hidden md:block self-center">
                      <EffortIndicator value={w.perceivedEffort} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      to={`/workouts/${w._id}/edit`}
                      className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accentDim transition-all"
                    >
                      <Edit2 size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(w._id)}
                      className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-7">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost flex items-center gap-1"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="font-mono text-sm text-muted">
                {page} / {data.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="btn-ghost flex items-center gap-1"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
