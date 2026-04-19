import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { authApi } from '../../lib/api/auth.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { loginSchema } from '../../schemas/auth.js';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setBusy(true);
    try {
      const data = await authApi.login(values);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}.`);
      const redirect = location.state?.from || '/account';
      navigate(redirect, { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Members"
      title="Welcome back."
      sub="Sign in to access your wardrobe, orders and saved pieces."
      footer={<>New here? <Link to="/register" className="text-gold hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldWithIcon icon={<Mail size={14} />}>
          <Input label="Email" type="email" autoComplete="email" placeholder="you@elsewhere.com" error={errors.email?.message} {...register('email')} />
        </FieldWithIcon>
        <FieldWithIcon icon={<Lock size={14} />}>
          <Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        </FieldWithIcon>
        <div className="flex items-center justify-between text-xs text-ink-300">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-gold" defaultChecked /> Remember me
          </label>
          <Link to="/forgot" className="hover:text-gold">Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Signing in…' : (<>Sign in <ArrowRight size={16} /></>)}
        </Button>
      </form>
    </AuthShell>
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
