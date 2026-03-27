import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Weight } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useBodyWeight, useCreateBodyWeight, useDeleteBodyWeight } from '../../hooks/useQueries';
import { PageHeader, LoadingState, EmptyState, Modal, FormField, Spinner } from '../../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  recordedAt: z.string().min(1, 'Required'),
  weightKg: z.string().min(1, 'Required'),
});
type FormData = z.infer<typeof schema>;

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface border border-borderLight rounded-lg px-4 py-2.5 shadow-xl">
        <p className="font-mono text-xs text-muted mb-1">{label}</p>
        <p className="font-display text-xl font-bold text-accent">{payload[0].value} <span className="text-xs text-muted font-mono">kg</span></p>
      </div>
    );
  }
  return null;
};

export default function BodyWeightPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: logs = [], isLoading } = useBodyWeight({ limit: 90 });
  const createMutation = useCreateBodyWeight();
  const deleteMutation = useDeleteBodyWeight();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recordedAt: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync({
      recordedAt: new Date(data.recordedAt).toISOString(),
      weightKg: parseFloat(data.weightKg),
    });
    setModalOpen(false);
    reset({ recordedAt: new Date().toISOString().split('T')[0] });
  };

  const chartData = logs.map(l => ({
    date: format(new Date(l.recordedAt), 'MMM d'),
    weight: l.weightKg,
    id: l._id,
  }));

  const latest = logs[logs.length - 1];
  const earliest = logs[0];
  const delta = latest && earliest && logs.length > 1
    ? (latest.weightKg - earliest.weightKg).toFixed(1)
    : null;

  return (
    <div>
      <PageHeader
        title="Body Weight"
        subtitle="Track your weight over time"
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Log Weight
          </button>
        }
      />

      {isLoading ? <LoadingState /> : (
        <>
          {/* Stats row */}
          {logs.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="card text-center">
                <div className="label mb-1">Current</div>
                <div className="font-display text-3xl font-bold text-accent">{latest.weightKg}</div>
                <div className="font-mono text-xs text-muted">kg</div>
              </div>
              <div className="card text-center">
                <div className="label mb-1">Change</div>
                <div className={`font-display text-3xl font-bold ${!delta ? 'text-muted' : parseFloat(delta) < 0 ? 'text-success' : parseFloat(delta) > 0 ? 'text-danger' : 'text-muted'}`}>
                  {delta ? `${parseFloat(delta) > 0 ? '+' : ''}${delta}` : '—'}
                </div>
                <div className="font-mono text-xs text-muted">kg total</div>
              </div>
              <div className="card text-center">
                <div className="label mb-1">Logs</div>
                <div className="font-display text-3xl font-bold text-textPrimary">{logs.length}</div>
                <div className="font-mono text-xs text-muted">entries</div>
              </div>
            </div>
          )}

          {/* Chart */}
          {logs.length > 1 ? (
            <div className="card mb-6">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-5">Weight Trend</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false} tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="weight" stroke="#f5a623"
                    strokeWidth={2} dot={{ fill: '#f5a623', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#f5a623' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : logs.length === 1 && (
            <div className="card mb-6 text-center py-8 text-muted font-mono text-sm">
              Log at least 2 entries to see a trend chart.
            </div>
          )}

          {/* Log table */}
          {logs.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Weight}
                title="No weight logs yet"
                description="Start tracking your body weight to see trends over time."
                action={<button onClick={() => setModalOpen(true)} className="btn-primary">Log First Entry</button>}
              />
            </div>
          ) : (
            <div className="card">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-4">History</h2>
              <div className="space-y-1">
                {[...logs].reverse().map((log, i) => (
                  <div key={log._id} className={`flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surfaceHover transition-colors animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                    <span className="font-mono text-sm text-textSecondary">
                      {format(new Date(log.recordedAt), 'EEEE, MMM d, yyyy')}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="font-display font-bold text-lg text-textPrimary">{log.weightKg} <span className="text-xs text-muted font-mono">kg</span></span>
                      <button
                        onClick={() => { if (confirm('Delete log?')) deleteMutation.mutate(log._id); }}
                        className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Weight">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Date" error={errors.recordedAt?.message} required>
            <input {...register('recordedAt')} type="date" className="input" />
          </FormField>
          <FormField label="Weight (kg)" error={errors.weightKg?.message} required>
            <input {...register('weightKg')} type="number" step="0.1" className="input" placeholder="75.5" autoFocus />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner size="sm" /> : null} Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
