import { useState, useEffect } from 'react';
import api from '../utils/api';
import type { User } from '../types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (phone: string) => {
    try {
      const { data } = await api.get(`/users/${phone}`);
      setUser(data);
      localStorage.setItem('jobalert_phone', phone);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, phone: string) => {
    try {
      const { data } = await api.post('/users/register', { name, phone });
      setUser(data);
      localStorage.setItem('jobalert_phone', phone);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const updatePreferences = async (preferences: any) => {
    if (!user) return;
    try {
      const { data } = await api.post('/users/preferences', {
        phone: user.phone,
        preferences
      });
      setUser(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update preferences');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jobalert_phone');
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem('jobalert_phone');
    if (savedPhone) {
      fetchUser(savedPhone);
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, register, updatePreferences, logout };
};
