import { useState } from 'react';
import { Plus, Pencil, Trash2, Lock, Search } from 'lucide-react';
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise } from '../../hooks/useQueries';
import { PageHeader, LoadingState, EmptyState, CategoryBadge, Modal, FormField, Spinner } from '../../components/ui';
import type { Exercise, ExerciseCategory, MeasurementType } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const CATEGORIES: ExerciseCategory[] = ['push', 'pull', 'legs', 'core', 'cardio', 'mobility', 'skill'];

const schema = z.object({
  name: z.string().min(1, 'Required').max(100),
  category: z.enum(['push', 'pull', 'legs', 'core', 'cardio', 'mobility', 'skill']),
  measurementType: z.enum(['reps', 'duration', 'distance']),
});
type FormData = z.infer<typeof schema>;

export default function ExercisesPage() {
  const { data: exercises = [], isLoading } = useExercises();
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const deleteMutation = useDeleteExercise();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'push', measurementType: 'reps' },
  });

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditing(null); reset({ category: 'push', measurementType: 'reps' }); setModalOpen(true); };
  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    reset({ name: ex.name, category: ex.category, measurementType: ex.measurementType });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this exercise?')) return;
    deleteMutation.mutate(id);
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filtered.filter(e => e.category === cat);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div>
      <PageHeader
        title="Exercises"
        subtitle={`${exercises.filter(e => e.isDefault).length} default · ${exercises.filter(e => !e.isDefault).length} custom`}
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> New Exercise
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search exercises..."
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${categoryFilter === 'all' ? 'bg-accent text-background font-semibold' : 'bg-surface border border-border text-textSecondary hover:border-borderLight'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-mono capitalize transition-all ${categoryFilter === cat ? 'bg-accent text-background font-semibold' : 'bg-surface border border-border text-textSecondary hover:border-borderLight'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <LoadingState /> : filtered.length === 0 ? (
        <div className="card">
          <EmptyState title="No exercises found" description="Try a different search or add a custom one." />
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.filter(cat => categoryFilter === 'all' || cat === categoryFilter).map(cat => {
            const list = grouped[cat];
            if (!list.length) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-3">
                  <CategoryBadge category={cat} />
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-mono text-xs text-muted">{list.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {list.map((ex, i) => (
                    <div key={ex._id} className={`flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border hover:border-borderLight transition-all animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                      <div className="flex-1 min-w-0">
                        <div className="font-body font-medium text-sm text-textPrimary truncate">{ex.name}</div>
                        <div className="font-mono text-xs text-muted mt-0.5">{ex.measurementType}</div>
                      </div>
                      {ex.isDefault ? (
                        <Lock size={13} className="text-muted flex-shrink-0" title="Default exercise" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(ex)} className="p-1.5 rounded text-muted hover:text-accent hover:bg-accentDim transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(ex._id)} className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Exercise' : 'New Exercise'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" error={errors.name?.message} required>
            <input {...register('name')} className="input" placeholder="e.g. Archer Push-Up" autoFocus />
          </FormField>
          <FormField label="Category" error={errors.category?.message} required>
            <select {...register('category')} className="input">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </FormField>
          <FormField label="Measurement Type" error={errors.measurementType?.message} required>
            <select {...register('measurementType')} className="input">
              {(['reps', 'duration', 'distance'] as MeasurementType[]).map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner size="sm" /> : null}
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
