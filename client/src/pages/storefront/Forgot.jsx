import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { authApi } from '../../lib/api/auth.js';
import { forgotSchema, resetSchema } from '../../schemas/auth.js';

export default function Forgot() {
  const [params] = useSearchParams();
  const token = params.get('token');
  return token ? <ResetForm token={token} /> : <ForgotForm />;
}

function ForgotForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async ({ email }) => {
    setBusy(true);
    try {
      await authApi.forgot(email);
      setSent(true);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not send link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account"
      title="Reset your password."
      sub="We'll email you a secure link. It expires in one hour."
      footer={<>Remembered it? <Link to="/login" className="text-gold hover:underline">Sign in</Link></>}
    >
      {sent ? (
        <div className="glass rounded-2xl p-6 flex items-start gap-3">
          <CheckCircle2 className="text-gold mt-0.5" size={20} />
          <div>
            <p className="font-display text-lg">Check your inbox.</p>
            <p className="mt-1 text-sm text-ink-300">If an account exists for that email, a reset link is on its way. (In dev, check the server console for the link.)</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-[34px] text-ink-300 z-10"><Mail size={14} /></span>
            <div className="[&_input]:pl-9">
              <Input label="Email" type="email" autoComplete="email" placeholder="you@elsewhere.com" error={errors.email?.message} {...register('email')} />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? 'Sending…' : (<>Send reset link <ArrowRight size={16} /></>)}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

function ResetForm({ token }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password }) => {
    setBusy(true);
    try {
      await authApi.reset(token, password);
      toast.success('Password updated. Please sign in.');
      navigate('/login', { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Account" title="Choose a new password." sub="Make it long and memorable.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <span className="absolute left-3 top-[34px] text-ink-300 z-10"><Lock size={14} /></span>
          <div className="[&_input]:pl-9">
            <Input label="New password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-[34px] text-ink-300 z-10"><Lock size={14} /></span>
          <div className="[&_input]:pl-9">
            <Input label="Confirm" type="password" autoComplete="new-password" placeholder="Repeat the new password" error={errors.confirm?.message} {...register('confirm')} />
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  );
}
