'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import type { AuthResponse } from '../types/auth.types';
import { isAdmin, isSuperAdmin } from '@/shared/types/common.types';

interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTrainer: boolean;
  isSuperAdmin: boolean;
  activeMode: 'client' | 'trainer' | 'superadmin';
  setActiveMode: (mode: 'client' | 'trainer' | 'superadmin') => void;
  availableModes: ('client' | 'trainer' | 'superadmin')[];
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeModeState, setActiveModeState] = useState<'client' | 'trainer' | 'superadmin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ob_token');
    const savedUser = localStorage.getItem('ob_user');
    const savedMode = localStorage.getItem('ob_mode') as 'client' | 'trainer' | 'superadmin' | null;
    
    if (savedToken && savedUser && savedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(savedToken);
        setUser(parsedUser);
        if (savedMode) setActiveModeState(savedMode);

        // Fetch fresh profile in the background to update role and assignments
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const baseUrl = apiUrl.endsWith('/api/v1') ? apiUrl : `${apiUrl.replace(/\/$/, '')}/api/v1`;
        fetch(`${baseUrl}/users/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((r) => r.json())
          .then((res) => {
            if (res?.success && res.data) {
              setUser(res.data);
              localStorage.setItem('ob_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {});
      } catch {
        localStorage.removeItem('ob_token');
        localStorage.removeItem('ob_user');
        localStorage.removeItem('ob_mode');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthResponse) => {
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('ob_token', data.accessToken);
    localStorage.setItem('ob_user', JSON.stringify(data.user));
    localStorage.removeItem('ob_mode');
    setActiveModeState(null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveModeState(null);
    localStorage.removeItem('ob_token');
    localStorage.removeItem('ob_user');
    localStorage.removeItem('ob_mode');
    window.location.href = '/';
  };

  const setActiveMode = (mode: 'client' | 'trainer' | 'superadmin') => {
    setActiveModeState(mode);
    localStorage.setItem('ob_mode', mode);
  };

  const isTrainerRole = !!user && isAdmin(user.role);
  const isSuperAdminRole = !!user && isSuperAdmin(user.role);

  const availableModes: ('client' | 'trainer' | 'superadmin')[] = ['client'];
  if (isTrainerRole) availableModes.push('trainer');
  if (isSuperAdminRole) availableModes.push('superadmin');

  const activeMode = activeModeState && availableModes.includes(activeModeState)
    ? activeModeState
    : isSuperAdminRole
      ? 'superadmin'
      : isTrainerRole
        ? 'trainer'
        : 'client';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        isTrainer: isTrainerRole,
        isSuperAdmin: isSuperAdminRole,
        activeMode,
        setActiveMode,
        availableModes,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
