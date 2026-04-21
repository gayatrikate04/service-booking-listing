'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
const CITIES = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Surat',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal'
];

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    password: '', role: 'customer', city: 'New York',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim())          errs.full_name = 'Name is required';
    if (!form.email.includes('@'))       errs.email     = 'Valid email required';
    if (!/^\d{10}$/.test(form.phone))    errs.phone     = '10-digit phone number required';
    if (form.password.length < 8)        errs.password  = 'Minimum 8 characters';
    if (!/[A-Z]/.test(form.password))    errs.password  = 'Include at least one uppercase letter';
    if (!/[0-9]/.test(form.password))    errs.password  = 'Include at least one number';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      // REAL API CALL — POST /auth/register
      const result = await authService.register(form);
      setAuth(result.data.user, result.data.accessToken);

      // Provider goes to onboarding to complete their profile
      // Customer goes directly to provider listing
      if (result.data.user.role === 'provider') {
        router.push('/onboarding');
      } else {
        router.push('/providers');
      }
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="register-page">

    {/* ── Heading ── */}
    <div className="text-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
      <p className="text-sm text-gray-500 mt-1">Join thousands of users on ServiceBook</p>
    </div>

    {/* ── Card ── */}
    <div className="form-card">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Role selector ── */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
            I want to
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'customer', icon: '🛒', label: 'Book Services',  sub: 'Find professionals' },
              { value: 'provider', icon: '🔧', label: 'Offer Services', sub: 'Grow my business'   },
            ].map((r) => {
              const isActive = form.role === r.value;
              return (
                <label
                  key={r.value}
                  data-selected={isActive}
                  className={`role-card${isActive ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={isActive}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span style={{ fontSize: '18px', display: 'block', marginBottom: '6px' }}>{r.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#111111', display: 'block' }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
                    {r.sub}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

        {/* ── Full name + City ── */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="John Doe"
            error={errors.full_name}
            autoFocus
          />
          <div>
            <label htmlFor="city">City</label>
            <select
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '32px',
              }}
            >
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ── Email ── */}
        <Input
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
        />

        {/* ── Phone ── */}
        <Input
          label="Phone number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="9876543210"
          
          error={errors.phone}
          maxLength={10}
        />

        {/* ── Password ── */}
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          error={errors.password}
          autoComplete="new-password"
        />

        {/* ── API error ── */}
        {apiError && (
          <div className="field-error" style={{ padding: '10px 13px', borderRadius: '8px', fontSize: '12px', border: '1px solid' }}>
            {apiError}
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="btn-submit"
          style={{ marginTop: '8px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

      </form>
    </div>

    {/* ── Footer ── */}
    <p className="text-center text-sm text-gray-500 mt-6">
      Already have an account?{' '}
      <Link href="/login" className="signin-link">
        Sign in
      </Link>
    </p>

  </div>
);
}