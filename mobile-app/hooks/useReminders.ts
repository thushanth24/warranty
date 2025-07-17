import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../config/config';
import { useAuth } from './useAuth';

export interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  itemType: string;
  isActive: boolean;
}

export function useReminders() {
  const { user } = useAuth();
  return useQuery<Reminder[]>({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await axios.get(`${BACKEND_URL}/api/reminders/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });
}
