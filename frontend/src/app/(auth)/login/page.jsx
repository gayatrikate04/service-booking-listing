'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.login(form);
      setAuth(result.data.user, result.data.accessToken);
      if (result.data.user.role === 'provider') {
        router.push('/provider/dashboard');
      } else {
        router.push('/providers');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">

      {/* ── Heading ── */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      {/* ── Card ── */}
      <div className="form-card">
        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {/* ── Error ── */}
          {error && (
            <div
              className="field-error"
              style={{
                padding: '10px 13px',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid',
              }}
            >
              {error}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
            style={{
              marginTop: '8px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

        </form>

        {/* ── Divider ── */}
        <div style={{ position: 'relative', margin: '20px 0' }}>
          <div style={{ height: '1px', background: '#f3f4f6' }} />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#ffffff',
              padding: '0 10px',
              fontSize: '11px',
              color: '#9ca3af',
              whiteSpace: 'nowrap',
            }}
          >
            
          </div>
        </div>

        </div>

      {/* ── Footer ── */}
      <p className="text-center text-sm text-gray-500 mt-6">
        No account?{' '}
        <Link href="/register" className="signin-link">
          Create one
        </Link>
      </p>

    </div>
  );
}