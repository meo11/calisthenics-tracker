import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useExercises } from '../../hooks/useQueries';
import { FormField, Spinner, CategoryBadge } from '../ui';
import type { WorkoutLog } from '../../types';

const setSchema = z.object({
  reps: z.string().optional(),
  weightKg: z.string().optional(),
  durationSeconds: z.string().optional(),
  distanceMeters: z.string().optional(),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1, 'Select an exercise'),
  exerciseNameSnapshot: z.string(),
  measurementType: z.enum(['reps', 'duration', 'distance']),
  sets: z.array(setSchema).min(1),
});

export const workoutFormSchema = z.object({
  workoutDate: z.string().min(1, 'Required'),
  workoutType: z.enum(['push', 'pull', 'legs', 'core', 'full body', 'custom']),
  durationMinutes: z.string().optional(),
  perceivedEffort: z.string().optional(),
  notes: z.string().max(1000).optional(),
  exercises: z.array(exerciseEntrySchema).min(1, 'Add at least one exercise'),
});

export type WorkoutFormData = z.infer<typeof workoutFormSchema>;

interface WorkoutFormProps {
  defaultValues?: Partial<WorkoutFormData>;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  submitLabel?: string;
}

export default function WorkoutForm({ defaultValues, onSubmit, submitLabel = 'Save Workout' }: WorkoutFormProps) {
  const { data: exercises = [] } = useExercises();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState<number | null>(null);

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: defaultValues || {
      workoutDate: new Date().toISOString().split('T')[0],
      workoutType: 'custom',
      exercises: [],
    },
  });

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control, name: 'exercises',
  });

  const watchedExercises = watch('exercises');

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const handleSelectExercise = (idx: number, ex: typeof exercises[0]) => {
    setValue(`exercises.${idx}.exerciseId`, ex._id);
    setValue(`exercises.${idx}.exerciseNameSnapshot`, ex.name);
    setValue(`exercises.${idx}.measurementType`, ex.measurementType);
    setValue(`exercises.${idx}.sets`, [{}]);
    setShowExercisePicker(null);
    setExerciseSearch('');
    setExpandedIdx(idx);
  };

  const addExercise = () => {
    appendExercise({ exerciseId: '', exerciseNameSnapshot: '', measurementType: 'reps', sets: [{}] });
    setShowExercisePicker(exerciseFields.length);
    setExpandedIdx(exerciseFields.length);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Workout meta */}
      <div className="card">
        <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-4">Session Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date" error={errors.workoutDate?.message} required>
            <input {...register('workoutDate')} type="date" className="input" />
          </FormField>

          <FormField label="Type" error={errors.workoutType?.message} required>
            <select {...register('workoutType')} className="input">
              {['push', 'pull', 'legs', 'core', 'full body', 'custom'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Duration (min)" error={errors.durationMinutes?.message}>
            <input {...register('durationMinutes')} type="number" className="input" placeholder="45" />
          </FormField>

          <FormField label="Perceived Effort (1–10)">
            <input {...register('perceivedEffort')} type="number" min="1" max="10" className="input" placeholder="7" />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Notes">
            <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="How did it feel?" />
          </FormField>
        </div>
      </div>

      {/* Exercises */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">Exercises</h3>
          <span className="font-mono text-xs text-muted">{exerciseFields.length} added</span>
        </div>

        {errors.exercises?.root && (
          <div className="text-danger text-xs font-mono mb-3">{errors.exercises.root.message}</div>
        )}

        <div className="space-y-3">
          {exerciseFields.map((field, idx) => {
            const ex = watchedExercises[idx];
            const isExpanded = expandedIdx === idx;
            const measureType = ex?.measurementType || 'reps';

            return (
              <div key={field.id} className="card border-borderLight">
                {/* Exercise header */}
                <div className="flex items-center gap-3">
                  <GripVertical size={14} className="text-muted flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    {ex?.exerciseId ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold tracking-wide uppercase text-sm">
                          {ex.exerciseNameSnapshot}
                        </span>
                        <span className="font-mono text-xs text-muted">— {ex.sets.length} sets</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowExercisePicker(idx)}
                        className="text-accent text-sm font-mono hover:text-accentHover"
                      >
                        + Select exercise
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      className="p-1.5 rounded text-muted hover:text-textPrimary hover:bg-surfaceHover">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button type="button" onClick={() => removeExercise(idx)}
                      className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Exercise picker */}
                {showExercisePicker === idx && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <input
                      autoFocus
                      value={exerciseSearch}
                      onChange={e => setExerciseSearch(e.target.value)}
                      className="input mb-2"
                      placeholder="Search exercises..."
                    />
                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {filteredExercises.map(e => (
                        <button
                          key={e._id}
                          type="button"
                          onClick={() => handleSelectExercise(idx, e)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-surfaceHover transition-colors"
                        >
                          <CategoryBadge category={e.category} />
                          <span className="text-sm text-textPrimary font-body">{e.name}</span>
                          <span className="font-mono text-xs text-muted ml-auto">{e.measurementType}</span>
                        </button>
                      ))}
                      {filteredExercises.length === 0 && (
                        <p className="text-muted text-sm text-center py-4 font-mono">No exercises found</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Sets */}
                {isExpanded && ex?.exerciseId && (
                  <ExerciseSets
                    idx={idx}
                    measureType={measureType}
                    register={register}
                    control={control}
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addExercise}
          className="w-full mt-3 flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-textSecondary hover:text-accent hover:border-accent/40 transition-all text-sm font-body"
        >
          <Plus size={16} /> Add Exercise
        </button>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3">
        {isSubmitting ? <><Spinner size="sm" /> Saving...</> : submitLabel}
      </button>
    </form>
  );
}

function ExerciseSets({ idx, measureType, register, control }: {
  idx: number;
  measureType: string;
  register: ReturnType<typeof useForm<WorkoutFormData>>['register'];
  control: ReturnType<typeof useForm<WorkoutFormData>>['control'];
}) {
  const { fields, append, remove } = useFieldArray({ control, name: `exercises.${idx}.sets` });

  return (
    <div className="mt-4 pt-4 border-t border-border">
      {/* Set headers */}
      <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: 'auto 1fr 1fr auto' }}>
        <span className="label text-center w-8">Set</span>
        {measureType === 'reps' && <>
          <span className="label">Reps</span>
          <span className="label">Weight (kg)</span>
        </>}
        {measureType === 'duration' && <>
          <span className="label">Duration (s)</span>
          <span className="label" />
        </>}
        {measureType === 'distance' && <>
          <span className="label">Distance (m)</span>
          <span className="label" />
        </>}
        <span className="w-7" />
      </div>

      {fields.map((setField, setIdx) => (
        <div key={setField.id} className="grid gap-2 mb-2 items-center" style={{ gridTemplateColumns: 'auto 1fr 1fr auto' }}>
          <span className="font-mono text-xs text-muted text-center w-8">{setIdx + 1}</span>
          {measureType === 'reps' && <>
            <input {...register(`exercises.${idx}.sets.${setIdx}.reps`)} type="number" className="input py-2 text-sm" placeholder="10" />
            <input {...register(`exercises.${idx}.sets.${setIdx}.weightKg`)} type="number" step="0.5" className="input py-2 text-sm" placeholder="0" />
          </>}
          {measureType === 'duration' && <>
            <input {...register(`exercises.${idx}.sets.${setIdx}.durationSeconds`)} type="number" className="input py-2 text-sm" placeholder="30" />
            <div />
          </>}
          {measureType === 'distance' && <>
            <input {...register(`exercises.${idx}.sets.${setIdx}.distanceMeters`)} type="number" className="input py-2 text-sm" placeholder="100" />
            <div />
          </>}
          <button type="button" onClick={() => fields.length > 1 && remove(setIdx)}
            className="w-7 h-7 flex items-center justify-center rounded text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-30"
            disabled={fields.length <= 1}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({})}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors font-mono mt-1"
      >
        <Plus size={12} /> Add set
      </button>
    </div>
  );
}
