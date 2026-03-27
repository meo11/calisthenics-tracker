import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { authApi } from '../../api';
import { FormField, Spinner } from '../../components/ui';
import { Zap } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await authApi.login(data);
      login(result.token, result.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
            <Zap size={28} className="text-background fill-background" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-widest uppercase text-textPrimary">Calisthenic</h1>
          <p className="text-muted text-xs font-mono tracking-widest mt-1 uppercase">Progress Tracker</p>
        </div>

        <div className="card border-borderLight">
          <h2 className="font-display text-2xl font-bold tracking-wide uppercase mb-6">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" error={errors.email?.message} required>
              <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
            </FormField>

            {serverError && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5 text-danger text-sm font-mono">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? <><Spinner size="sm" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-textSecondary text-sm mt-5">
          No account?{' '}
          <Link to="/register" className="text-accent hover:text-accentHover transition-colors font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
