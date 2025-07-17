import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../config/config';
import { useAuth } from './useAuth';

export interface EnhancedWarranty {
  id: string;
  productName: string;
  provider: string;
  coverageDetails: string;
  expirationDate: string;
  status: string;
}

export function useEnhancedWarranties() {
  const { user } = useAuth();
  return useQuery<EnhancedWarranty[]>({
    queryKey: ['enhanced-warranties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await axios.get(`${BACKEND_URL}/api/enhanced-warranties/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });
}
