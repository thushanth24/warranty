import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../config/config';
import { useAuth } from './useAuth';

export interface Warranty {
  id: string;
  productName: string;
  expirationDate: string;
  status: string;
  isTransferred?: boolean;
}

export function useWarranties() {
  const { user } = useAuth();
  return useQuery<Warranty[]>({
    queryKey: ['warranties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await axios.get(`${BACKEND_URL}/api/warranties/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });
}
