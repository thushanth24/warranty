import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../config/config';
import { useAuth } from './useAuth';

export interface Subscription {
  id: string;
  name: string;
  nextRenewalDate: string;
  status: string;
  amount?: number;
  category?: string;
}

export function useSubscriptions() {
  const { user } = useAuth();
  return useQuery<Subscription[]>({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await axios.get(`${BACKEND_URL}/api/subscriptions/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });
}
