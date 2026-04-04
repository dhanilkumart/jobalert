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
      
      // BYPASS: If fetching guest fails (e.g. server error), use a local mock user
      if (phone === 'guest_user') {
        setUser({
          name: 'Guest User',
          phone: 'guest_user',
          jobPreferences: [{ title: 'Developer', location: 'India' }],
          sources: ['linkedin', 'naukri', 'shine', 'indeed'],
          alertsEnabled: false,
          frequency: 'instant'
        } as any);
      } else {
        // If a real phone was saved but is now invalid/failed, clear it and try guest
        localStorage.removeItem('jobalert_phone');
        setUser(null);
        fetchUser('guest_user');
      }
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
    localStorage.removeItem('jobalert_phone');
    // BYPASS: After logout, go back to guest mode
    fetchUser('guest_user');
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem('jobalert_phone');
    if (savedPhone) {
      fetchUser(savedPhone);
    } else {
      // BYPASS: Auto-login as guest if nothing found
      fetchUser('guest_user');
    }
  }, []);

  return { user, loading, error, register, updatePreferences, logout };
};
