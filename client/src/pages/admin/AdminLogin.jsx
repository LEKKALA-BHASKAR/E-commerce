import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ShieldCheck, ArrowRight, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { authApi } from '../../lib/api/auth.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { loginSchema } from '../../schemas/auth.js';

const STAFF_ROLES = ['superadmin', 'manager', 'editor'];

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setBusy(true);
    try {
      const data = await authApi.login(values);
      if (!STAFF_ROLES.includes(data.user?.role)) {
        toast.error('Staff access only');
        try { await authApi.logout(); } catch {}
        return;
      }
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}.`);
      const redirect = location.state?.from || '/admin';
      navigate(redirect, { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-ink-800 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(217,119,6,0.10), transparent 60%), radial-gradient(ellipse at bottom right, rgba(217,119,6,0.06), transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">
            <Wheat size={20} />
          </span>
          <span className="font-display text-3xl">
            Sahara <span className="text-xs ml-1 align-top text-ink-400 uppercase tracking-[0.3em]">admin</span>
          </span>
        </Link>

        <div className="glass-strong p-8 sm:p-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold mb-2">
            <ShieldCheck size={14} /> Staff portal
          </div>
          <h1 className="font-display text-3xl mb-2">Sign in to manage Sahara.</h1>
          <p className="text-sm text-ink-400 mb-8">Restricted area. Staff credentials only.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldWithIcon icon={<Mail size={14} />}>
              <Input label="Email" type="email" autoComplete="email" placeholder="you@sahara.dev" error={errors.email?.message} {...register('email')} />
            </FieldWithIcon>
            <FieldWithIcon icon={<Lock size={14} />}>
              <Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            </FieldWithIcon>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : (<>Enter admin <ArrowRight size={16} /></>)}
            </Button>
          </form>

          <p className="mt-8 text-xs text-center text-ink-400">
            Not a staff member? <Link to="/" className="text-gold hover:underline">Return to storefront</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldWithIcon({ icon, children }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-[34px] text-ink-300 z-10">{icon}</span>
      <div className="[&_input]:pl-9">{children}</div>
    </div>
  );
}
