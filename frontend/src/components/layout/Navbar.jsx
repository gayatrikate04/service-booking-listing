'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useUser } from '@/store/authStore';
import { getInitials } from '@/utils/format';
import { useEffect, useState } from 'react';

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'text-black bg-gray-100'
          : 'text-gray-500 hover:text-black hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const user     = useUser();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router   = useRouter();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-4">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">S</span>
            </div>
            <span className="text-sm font-semibold text-black tracking-tight">
              ServiceBook
            </span>
          </Link>

          {/* ── Nav links ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            <NavLink href="/providers">Categories</NavLink>
            <NavLink href="/#how-it-works">How It Works</NavLink>
            {(!user || user.role === 'customer') && (
              <NavLink href="/onboarding">Become a Provider</NavLink>
            )}
          </nav>

          <div className="flex-1" />

          {/* ── Auth section ── */}
          {user ? (
            <div className="flex items-center gap-2">

              {user.role === 'customer' && (
                <NavLink href="/dashboard">My Bookings</NavLink>
              )}
              {user.role === 'provider' && (
                <NavLink href="/provider/dashboard">Provider Inbox</NavLink>
              )}

              {/* Divider + user info */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-black leading-tight">
                    {user.full_name}
                  </p>
                  <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
                </div>

                {/* Avatar */}
                <Link
                  href={user.role === 'provider' ? '/provider/dashboard' : '/profile'}
                  className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {getInitials(user.full_name)}
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 hover:text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}