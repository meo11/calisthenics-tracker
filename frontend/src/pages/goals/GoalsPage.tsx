import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Archive, Target, Circle } from 'lucide-react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useExercises } from '../../hooks/useQueries';
import { PageHeader, LoadingState, EmptyState, Modal, FormField, Spinner, ProgressBar } from '../../components/ui';
import { useGoalProgress } from '../../hooks/useQueries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Goal, GoalStatus } from '../../types';
import clsx from 'clsx';

const schema = z.object({
  exerciseId: z.string().min(1, 'Select an exercise'),
  goalType: z.enum(['reps', 'sets', 'weight', 'duration', 'milestone']),
  targetValue: z.string().min(1, 'Required'),
  targetSets: z.string().optional(),
  notes: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

const STATUS_TABS: GoalStatus[] = ['active', 'completed', 'archived'];

export default function GoalsPage() {
  const [tab, setTab] = useState<GoalStatus>('active');
  const [modalOpen, setModalOpen] = useState(false);
  const { data: goals = [], isLoading } = useGoals(tab);
  const { data: goalProgress = [] } = useGoalProgress();
  const { data: exercises = [] } = useExercises();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { goalType: 'reps' },
  });

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync({
      exerciseId: data.exerciseId,
      goalType: data.goalType,
      targetValue: parseFloat(data.targetValue),
      targetSets: data.targetSets ? parseInt(data.targetSets) : undefined,
      notes: data.notes,
    });
    setModalOpen(false);
    reset();
  };

  const getProgress = (goalId: string) =>
    goalProgress.find(p => p.goalId === goalId);

  const getExerciseName = (goal: Goal) => {
    if (typeof goal.exerciseId === 'object') return goal.exerciseId.name;
    return exercises.find(e => e._id === goal.exerciseId)?.name || 'Unknown';
  };

  const handleStatusChange = (id: string, status: GoalStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle="Track your targets and milestones"
        action={
          <button onClick={() => { reset(); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> New Goal
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 w-fit mb-6">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-1.5 rounded text-sm font-mono transition-all capitalize',
              tab === t ? 'bg-accent text-background font-semibold' : 'text-textSecondary hover:text-textPrimary'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingState /> : goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title={`No ${tab} goals`}
            description={tab === 'active' ? 'Set a goal to track your progress toward a skill or performance target.' : `No ${tab} goals yet.`}
            action={tab === 'active' ? <button onClick={() => setModalOpen(true)} className="btn-primary">Create Goal</button> : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, i) => {
            const progress = getProgress(goal._id);
            const exName = getExerciseName(goal);

            return (
              <div key={goal._id} className={`card-hover animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {goal.status === 'completed'
                      ? <CheckCircle2 size={18} className="text-success" />
                      : goal.status === 'archived'
                      ? <Archive size={18} className="text-muted" />
                      : <Circle size={18} className="text-accent" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display font-bold tracking-wide uppercase text-sm">{exName}</span>
                      <span className="badge bg-surfaceHover border border-border text-muted">{goal.goalType}</span>
                    </div>

                    <div className="font-mono text-sm text-textSecondary mb-2">
                      Target: <span className="text-accent font-semibold">{goal.targetValue}</span>
                      {goal.goalType === 'duration' ? 's' : goal.goalType === 'weight' ? 'kg' : ''}
                      {goal.targetSets && ` × ${goal.targetSets} sets`}
                    </div>

                    {progress && goal.status === 'active' && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-muted">
                            {progress.currentValue} / {progress.targetValue}
                          </span>
                          <span className="font-mono text-xs font-semibold text-accent">
                            {progress.progressPercent}%
                          </span>
                        </div>
                        <ProgressBar
                          percent={progress.progressPercent}
                          color={progress.progressPercent >= 100 ? 'success' : 'accent'}
                        />
                      </div>
                    )}

                    {goal.notes && (
                      <p className="text-xs text-muted italic">{goal.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {goal.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(goal._id, 'completed')}
                          className="p-1.5 rounded text-muted hover:text-success hover:bg-success/10 transition-all"
                          title="Mark complete"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(goal._id, 'archived')}
                          className="p-1.5 rounded text-muted hover:text-muted hover:bg-surfaceHover transition-all"
                          title="Archive"
                        >
                          <Archive size={15} />
                        </button>
                      </>
                    )}
                    {goal.status !== 'active' && (
                      <button
                        onClick={() => handleStatusChange(goal._id, 'active')}
                        className="p-1.5 rounded text-muted hover:text-accent hover:bg-accentDim transition-all"
                        title="Reactivate"
                      >
                        <Circle size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm('Delete goal?')) deleteMutation.mutate(goal._id); }}
                      className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Goal">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Exercise" error={errors.exerciseId?.message} required>
            <select {...register('exerciseId')} className="input">
              <option value="">Select exercise...</option>
              {exercises.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Goal Type" required>
              <select {...register('goalType')} className="input">
                {['reps', 'sets', 'weight', 'duration', 'milestone'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Target Value" error={errors.targetValue?.message} required>
              <input {...register('targetValue')} type="number" step="0.5" className="input" placeholder="10" />
            </FormField>
          </div>
          <FormField label="Target Sets (optional)">
            <input {...register('targetSets')} type="number" className="input" placeholder="3" />
          </FormField>
          <FormField label="Notes">
            <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="Any context..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner size="sm" /> : null} Create Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
