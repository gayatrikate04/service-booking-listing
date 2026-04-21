import { create } from 'zustand';

// Reads initial state from localStorage so user stays logged in after refresh
function getInitialAuth() {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const token = localStorage.getItem('access_token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

export const useAuthStore = create((set) => ({
  ...getInitialAuth(),

  // Called after successful login or register
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  // Called on logout or 401
  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

// Convenience hooks — keeps component code cleaner
export const useUser      = () => useAuthStore((s) => s.user);
export const useIsAuth    = () => useAuthStore((s) => !!s.token);