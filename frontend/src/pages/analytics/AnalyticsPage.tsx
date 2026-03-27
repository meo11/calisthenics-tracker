import { useState } from 'react';
import { format } from 'date-fns';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Cell
} from 'recharts';
import {
  usePersonalBests, useWorkoutsPerWeek, useGoalProgress,
  useExerciseProgress, useStreaks, useExercises
} from '../../hooks/useQueries';
import { LoadingState, PageHeader, ProgressBar } from '../../components/ui';
import { Flame, Trophy, TrendingUp, Target, Zap } from 'lucide-react';

const BarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) return (
    <div className="bg-surface border border-borderLight rounded-lg px-3 py-2 shadow-xl">
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className="font-display text-lg font-bold text-accent">{payload[0].value} <span className="text-xs text-muted font-mono">sessions</span></p>
    </div>
  );
  return null;
};

const LineTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload?.length) return (
    <div className="bg-surface border border-borderLight rounded-lg px-3 py-2 shadow-xl">
      <p className="font-mono text-xs text-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-display text-lg font-bold text-accent">{p.value}</p>
      ))}
    </div>
  );
  return null;
};

export default function AnalyticsPage() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const { data: streaks, isLoading: streaksLoading } = useStreaks();
  const { data: pbs = [], isLoading: pbsLoading } = usePersonalBests();
  const { data: weeklyData = [], isLoading: weeklyLoading } = useWorkoutsPerWeek(12);
  const { data: goalProgressData = [], isLoading: goalLoading } = useGoalProgress();
  const { data: exerciseProgress = [] } = useExerciseProgress(selectedExercise);
  const { data: exercises = [] } = useExercises();

  const isLoading = streaksLoading || pbsLoading || weeklyLoading || goalLoading;
  if (isLoading) return <LoadingState text="Crunching numbers..." />;

  const totalWorkouts = weeklyData.reduce((s, w) => s + w.count, 0);
  const avgPerWeek = (totalWorkouts / weeklyData.length).toFixed(1);
  const busiestWeek = weeklyData.reduce((max, w) => w.count > max.count ? w : max, weeklyData[0]);

  const chartExercises = exercises.filter(e =>
    pbs.some(pb => pb.exerciseId === e._id)
  );

  const progressChartData = (exerciseProgress as Array<{ date: string; maxReps?: number; maxDuration?: number; totalVolume?: number }>).map((p) => ({
    date: format(new Date(p.date), 'MMM d'),
    reps: p.maxReps,
    duration: p.maxDuration,
    volume: p.totalVolume,
  }));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Your performance over time" />

      {/* Streak cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="card animate-fade-up stagger-1">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Current Streak</span>
            <Flame size={15} className={streaks?.currentStreak ? 'text-accent' : 'text-muted'} />
          </div>
          <div className={`font-display text-4xl font-bold ${streaks?.currentStreak ? 'text-accent' : 'text-muted'}`}>
            {streaks?.currentStreak ?? 0}<span className="text-lg ml-1 font-mono">d</span>
          </div>
        </div>
        <div className="card animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Longest Streak</span>
            <Zap size={15} className="text-muted" />
          </div>
          <div className="font-display text-4xl font-bold text-textPrimary">
            {streaks?.longestStreak ?? 0}<span className="text-lg ml-1 font-mono text-muted">d</span>
          </div>
        </div>
        <div className="card animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Avg / Week</span>
            <TrendingUp size={15} className="text-muted" />
          </div>
          <div className="font-display text-4xl font-bold text-textPrimary">{avgPerWeek}</div>
          <div className="font-mono text-xs text-muted mt-1">last 12 weeks</div>
        </div>
        <div className="card animate-fade-up stagger-4">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Best Week</span>
            <Trophy size={15} className="text-muted" />
          </div>
          <div className="font-display text-4xl font-bold text-textPrimary">
            {busiestWeek?.count ?? 0}<span className="text-lg ml-1 font-mono text-muted">sessions</span>
          </div>
        </div>
      </div>

      {/* Workouts per week bar chart */}
      <div className="card mb-6 animate-fade-up">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-5">Workouts Per Week</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" vertical={false} />
            <XAxis
              dataKey="week"
              tickFormatter={v => format(new Date(v + 'T00:00:00'), 'MMM d')}
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false} tickLine={false} width={25}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(245,166,35,0.05)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, i) => (
                <Cell key={i} fill={entry.count > 0 ? '#f5a623' : '#1e2330'} fillOpacity={entry.count > 0 ? 1 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Goal Progress */}
        <div className="card animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <Target size={16} className="text-accent" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">Goal Progress</h2>
          </div>
          {goalProgressData.length === 0 ? (
            <p className="text-muted font-mono text-sm py-4">No active goals. Set some goals to track progress here.</p>
          ) : (
            <div className="space-y-4">
              {goalProgressData.map(g => (
                <div key={g.goalId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-body font-medium text-sm text-textPrimary">{g.exerciseName}</span>
                      <span className="font-mono text-xs text-muted ml-2">{g.goalType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-textSecondary">{g.currentValue}/{g.targetValue}</span>
                      <span className={`font-mono text-xs font-semibold ${g.progressPercent >= 100 ? 'text-success' : 'text-accent'}`}>
                        {g.progressPercent}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    percent={g.progressPercent}
                    color={g.progressPercent >= 100 ? 'success' : 'accent'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal Bests */}
        <div className="card animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={16} className="text-accent" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">Personal Bests</h2>
          </div>
          {pbs.length === 0 ? (
            <p className="text-muted font-mono text-sm py-4">Log workouts to see your personal bests here.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {pbs.slice(0, 15).map((pb, i) => (
                <div key={pb.exerciseId} className={`flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                  <span className="font-body text-sm text-textPrimary truncate mr-3">{pb.exerciseName}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pb.maxReps && (
                      <span className="font-mono text-xs bg-accent/15 text-accent px-2 py-0.5 rounded">
                        {pb.maxReps} reps
                      </span>
                    )}
                    {pb.maxWeightKg && (
                      <span className="font-mono text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded">
                        {pb.maxWeightKg}kg
                      </span>
                    )}
                    {pb.maxDurationSeconds && (
                      <span className="font-mono text-xs bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded">
                        {pb.maxDurationSeconds}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Progress Chart */}
      <div className="card animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">Exercise Progress</h2>
          <select
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
            className="input w-auto text-sm py-1.5 px-3"
          >
            <option value="">Select exercise...</option>
            {chartExercises.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>

        {!selectedExercise ? (
          <p className="text-muted font-mono text-sm py-8 text-center">Select an exercise above to view its progress chart.</p>
        ) : progressChartData.length < 2 ? (
          <p className="text-muted font-mono text-sm py-8 text-center">Not enough data yet. Log more workouts with this exercise.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<LineTooltip />} />
              {progressChartData[0]?.reps != null && (
                <Line type="monotone" dataKey="reps" stroke="#f5a623" strokeWidth={2} dot={{ r: 3, fill: '#f5a623', strokeWidth: 0 }} activeDot={{ r: 5 }} name="Max Reps" />
              )}
              {progressChartData[0]?.duration != null && (
                <Line type="monotone" dataKey="duration" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 5 }} name="Duration (s)" />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
