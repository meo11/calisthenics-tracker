import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import {
  LayoutDashboard, Dumbbell, ListChecks, Target,
  BarChart2, Weight, LogOut, Menu, X, ChevronRight, Zap
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/exercises', icon: ListChecks, label: 'Exercises' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/bodyweight', icon: Weight, label: 'Body Weight' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-background fill-background" />
          </div>
          <div>
            <div className="font-display font-bold text-lg tracking-wider uppercase text-textPrimary leading-none">Calisthenic</div>
            <div className="font-mono text-[10px] text-muted tracking-widest uppercase">Progress Tracker</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group',
              isActive
                ? 'bg-accentDim text-accent border border-accent/20'
                : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceHover'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={clsx(isActive ? 'text-accent' : 'text-muted group-hover:text-textSecondary')} />
                <span className="font-body font-medium flex-1">{label}</span>
                {isActive && <ChevronRight size={12} className="text-accent opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-5 border-t border-border pt-4">
        <div className="px-3 py-3 rounded-lg bg-background/50 border border-border mb-2">
          <div className="font-display font-semibold text-sm tracking-wide text-textPrimary">{user?.name}</div>
          <div className="font-mono text-xs text-muted truncate">{user?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-textSecondary hover:text-danger hover:bg-danger/10 transition-all duration-150"
        >
          <LogOut size={15} />
          <span className="font-body">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-surface border-r border-border fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-50" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-surfaceHover text-textSecondary">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
              <Zap size={12} className="text-background fill-background" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider uppercase">Calisthenic</span>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
