'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUser } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getInitials } from '@/utils/format';
import api from '@/services/api';

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Chennai'];

export default function ProfilePage() {
  const user = useUser();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);


  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    city: user?.city || 'New York',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoad, setPwLoad] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();



  async function handleSave() {
    setLoading(true); setError(''); setSuccess('');
    try {
      // REAL API CALL — PATCH /users/me
      const result = await api.patch('/users/me', form);
      setAuth(result.data, token);  // update Zustand + localStorage
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  if (!user) return null;


  async function handleChangePassword() {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setError('Please fill in both password fields'); return;
    }
    if (pwForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters'); return;
    }
    setPwLoad(true); setError(''); setSuccess('');
    try {
      // REAL API CALL — PATCH /users/me/password
      await api.patch('/users/me/password', pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setPwLoad(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>

      {success && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Avatar + name */}
      <Card className="mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-700">
            {getInitials(user.full_name)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.full_name}</h2>
            <p className="text-sm text-gray-500 capitalize">{user.role} · Joined {new Date().getFullYear()}</p>
          </div>
        </div>

        {!editing ? (
          <>
            {[
              ['Full Name', user.full_name],
              ['Email', user.email],
              ['Phone', user.phone],
              ['City', user.city],
              ['Role', user.role],
              ['Verified', user.is_verified ? 'Yes' : 'Pending'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{v}</span>
              </div>
            ))}
            <Button variant="outline" onClick={() => setEditing(true)} className="mt-5">
              Edit Profile
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">City</label>
              <select
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" loading={loading} onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Change password */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            placeholder="Min. 8 characters"
            hint="Must include uppercase letter and number"
          />
          <Button variant="primary" loading={pwLoad} onClick={handleChangePassword}>
            Update Password
          </Button>
        </div>
      </Card>
    </div>
  );
}