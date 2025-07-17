import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../config/config';

export interface DashboardStats {
  warranties: number;
  subscriptions: number;
  reminders: number;
  dueSoon: number;
}

export interface UpcomingItem {
  id: string;
  title: string;
  dueDate: string;
  type: string;
}

import { useAuth } from './useAuth';

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      const res = await axios.get(`${BACKEND_URL}/api/dashboard/stats/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });
}

export function useUpcoming() {
  const { user } = useAuth();
  return useQuery<UpcomingItem[]>({
    queryKey: ['dashboard', 'upcoming', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      const res = await axios.get(`${BACKEND_URL}/api/dashboard/upcoming/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });
}
