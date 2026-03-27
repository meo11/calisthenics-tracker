import { ReactNode } from 'react';
import clsx from 'clsx';
import { Loader2, X } from 'lucide-react';

// Stat Card
export function StatCard({
  label, value, sub, icon: Icon, accent = false, className,
}: {
  label: string; value: string | number; sub?: string;
  icon?: React.ElementType; accent?: boolean; className?: string;
}) {
  return (
    <div className={clsx('card animate-fade-up', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="label">{label}</span>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center',
            accent ? 'bg-accent/15 text-accent' : 'bg-surfaceHover text-textSecondary')}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className={clsx('font-display text-3xl font-bold tracking-tight', accent ? 'text-accent' : 'text-textPrimary')}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted mt-1 font-mono">{sub}</div>}
    </div>
  );
}

// Spinner
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = size === 'sm' ? 14 : size === 'lg' ? 28 : 20;
  return <Loader2 size={s} className={clsx('animate-spin text-accent', className)} />;
}

// Loading state
export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" />
      <span className="text-muted text-sm font-mono">{text}</span>
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: React.ElementType; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surfaceHover border border-border flex items-center justify-center mb-1">
          <Icon size={24} className="text-muted" />
        </div>
      )}
      <div className="font-display text-lg font-semibold tracking-wide text-textPrimary">{title}</div>
      {description && <p className="text-textSecondary text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Modal
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-surface border border-border rounded-2xl w-full shadow-2xl animate-fade-up', width)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-xl font-bold tracking-wide uppercase">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surfaceHover text-muted hover:text-textPrimary transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Badge
export function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    push: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    pull: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    legs: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    core: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    cardio: 'bg-red-500/15 text-red-400 border-red-500/20',
    mobility: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    skill: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  };
  return (
    <span className={clsx('badge border', colors[category] || 'bg-surfaceHover text-muted border-border')}>
      {category}
    </span>
  );
}

// Effort dots
export function EffortIndicator({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={clsx('w-1.5 h-3 rounded-sm', i < value ? 'bg-accent' : 'bg-border')} />
      ))}
    </div>
  );
}

// Progress bar
export function ProgressBar({ percent, color = 'accent' }: { percent: number; color?: string }) {
  return (
    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all duration-500', {
          'bg-accent': color === 'accent',
          'bg-success': color === 'success',
          'bg-info': color === 'info',
        })}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

// Page header
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-textPrimary">{title}</h1>
        {subtitle && <p className="text-textSecondary text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

// Form field wrapper
export function FormField({ label, error, children, required }: {
  label: string; error?: string; children: ReactNode; required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-accent ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-danger text-xs mt-1.5 font-mono">{error}</p>}
    </div>
  );
}
