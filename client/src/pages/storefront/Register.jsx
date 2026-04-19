import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { authApi } from '../../lib/api/auth.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { registerSchema } from '../../schemas/auth.js';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setBusy(true);
    try {
      const data = await authApi.register(values);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success('Welcome to the maison.');
      navigate('/account', { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join the maison"
      title="Create your account."
      sub="Save pieces, track orders, and receive private previews."
      footer={<>Already a member? <Link to="/login" className="text-gold hover:underline">Sign in</Link></>}
      sideTitle="The pleasure of the considered."
      sideBody="Membership unlocks early access to capsule drops and atelier events."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldWithIcon icon={<User size={14} />}>
          <Input label="Full name" autoComplete="name" placeholder="Eleanor Voss" error={errors.name?.message} {...register('name')} />
        </FieldWithIcon>
        <FieldWithIcon icon={<Mail size={14} />}>
          <Input label="Email" type="email" autoComplete="email" placeholder="you@elsewhere.com" error={errors.email?.message} {...register('email')} />
        </FieldWithIcon>
        <FieldWithIcon icon={<Lock size={14} />}>
          <Input label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} hint="Use 8+ characters with a mix of letters and numbers." {...register('password')} />
        </FieldWithIcon>
        <p className="text-[11px] text-ink-300">By creating an account you agree to our <Link to="/terms" className="text-gold hover:underline">Terms</Link> and <Link to="/privacy" className="text-gold hover:underline">Privacy</Link>.</p>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Creating…' : (<>Create account <ArrowRight size={16} /></>)}
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
