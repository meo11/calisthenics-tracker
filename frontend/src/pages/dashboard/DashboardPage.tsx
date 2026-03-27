import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Dumbbell, Flame, Target, Weight, TrendingUp, Calendar, Plus, Trophy } from 'lucide-react';
import { useDashboard } from '../../hooks/useQueries';
import { StatCard, LoadingState, EmptyState, CategoryBadge, PageHeader, EffortIndicator } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();

  if (isLoading) return <LoadingState text="Loading dashboard..." />;

  const d = data!;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-textSecondary text-sm font-mono mb-1">{greeting}</p>
        <h1 className="font-display text-4xl font-bold tracking-wide uppercase text-textPrimary">
          {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-muted text-xs mt-1 font-mono">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Current Streak"
          value={`${d.streaks.currentStreak}d`}
          sub={`Best: ${d.streaks.longestStreak} days`}
          icon={Flame}
          accent={d.streaks.currentStreak > 0}
          className="stagger-1"
        />
        <StatCard
          label="This Week"
          value={d.workoutsThisWeek}
          sub="workouts"
          icon={Calendar}
          className="stagger-2"
        />
        <StatCard
          label="This Month"
          value={d.workoutsThisMonth}
          sub="workouts"
          icon={Dumbbell}
          className="stagger-3"
        />
        <StatCard
          label="Active Goals"
          value={d.activeGoals}
          sub="in progress"
          icon={Target}
          className="stagger-4"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
        {/* Total workouts */}
        <div className="card animate-fade-up stagger-1">
          <div className="flex items-center justify-between mb-2">
            <span className="label">All Time</span>
            <TrendingUp size={15} className="text-muted" />
          </div>
          <div className="font-display text-5xl font-bold text-textPrimary tracking-tight">{d.totalWorkouts}</div>
          <div className="text-xs text-muted font-mono mt-1">total workouts logged</div>
        </div>

        {/* Latest weight */}
        <div className="card animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Body Weight</span>
            <Weight size={15} className="text-muted" />
          </div>
          {d.latestWeight ? (
            <>
              <div className="font-display text-5xl font-bold text-textPrimary tracking-tight">{d.latestWeight}</div>
              <div className="text-xs text-muted font-mono mt-1">kg — latest log</div>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              <div className="font-display text-2xl text-muted">—</div>
              <Link to="/bodyweight" className="text-accent text-xs font-mono hover:underline">Log your weight →</Link>
            </div>
          )}
        </div>

        {/* Last workout date */}
        <div className="card animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Last Session</span>
            <Trophy size={15} className="text-muted" />
          </div>
          {d.streaks.lastWorkoutDate ? (
            <>
              <div className="font-display text-2xl font-bold text-textPrimary tracking-tight">
                {format(new Date(d.streaks.lastWorkoutDate), 'MMM d')}
              </div>
              <div className="text-xs text-muted font-mono mt-1">
                {format(new Date(d.streaks.lastWorkoutDate), 'EEEE')}
              </div>
            </>
          ) : (
            <div className="font-display text-2xl text-muted">No workouts yet</div>
          )}
        </div>
      </div>

      {/* Recent workouts */}
      <div className="card animate-fade-up stagger-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold tracking-wide uppercase">Recent Workouts</h2>
          <Link to="/workouts/new" className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={13} /> Log Workout
          </Link>
        </div>

        {d.recentWorkouts.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No workouts yet"
            description="Start logging your training sessions to see them here."
            action={<Link to="/workouts/new" className="btn-primary">Log First Workout</Link>}
          />
        ) : (
          <div className="space-y-2">
            {d.recentWorkouts.map((w, i) => (
              <Link
                key={w._id}
                to={`/workouts/${w._id}/edit`}
                className={`flex items-center gap-4 p-3.5 rounded-lg bg-background/50 border border-border hover:border-borderLight hover:bg-surfaceHover transition-all duration-150 animate-fade-up stagger-${i + 1}`}
              >
                <div className="w-10 h-10 rounded-lg bg-accentDim border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold text-sm tracking-wide uppercase text-textPrimary">
                      {w.workoutType}
                    </span>
                    <CategoryBadge category={w.workoutType} />
                  </div>
                  <div className="text-xs text-muted font-mono mt-0.5">
                    {format(new Date(w.workoutDate), 'MMM d, yyyy')}
                    {w.durationMinutes && ` · ${w.durationMinutes}min`}
                    {` · ${w.exercises.length} exercises`}
                  </div>
                </div>
                {w.perceivedEffort && (
                  <div className="hidden sm:block">
                    <EffortIndicator value={w.perceivedEffort} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {d.recentWorkouts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Link to="/workouts" className="text-accent text-sm font-mono hover:text-accentHover transition-colors">
              View all workouts →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
