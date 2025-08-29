import { useState } from 'react';
import { useAuth } from './useAuth';
import { BASEURL } from '@/constants/api';

interface Dispute {
  id: string;
  transaction_id: string;
  raised_by: string;
  reason: string;
  status: string;
  resolution?: string;
}

export const useDisputes = () => {
  const { user, isAuthenticated, refreshToken } = useAuth();
  const [disputes, setDisputes] = useState<{ [key: string]: Dispute[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputesByTransaction = async (transactionId: string) => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/disputes/transaction/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          const result = await refreshToken(refreshTokenValue);
          if (result) {
            const newResponse = await fetch(`${BASEURL}/disputes/transaction/${transactionId}`, {
              headers: {
                Authorization: `Bearer ${result.access_token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });
            if (!newResponse.ok) throw new Error('Failed to fetch disputes after token refresh');
            const data = await newResponse.json();
            setDisputes((prev) => ({ ...prev, [transactionId]: data }));
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } else if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      } else {
        const data = await response.json();
        setDisputes((prev) => ({ ...prev, [transactionId]: data }));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async (transactionId: string, reason: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ transaction_id: transactionId, raised_by: user?._id, reason, status: 'pending' }),
      });

      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          const result = await refreshToken(refreshTokenValue);
          if (result) {
            const newResponse = await fetch(`${BASEURL}/disputes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: `Bearer ${result.access_token}`,
              },
              body: JSON.stringify({ transaction_id: transactionId, raised_by: user?._id, reason, status: 'pending' }),
            });
            if (!newResponse.ok) throw new Error('Failed to create dispute after token refresh');
            await fetchDisputesByTransaction(transactionId);
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } else if (!response.ok) {
        throw new Error('Failed to create dispute');
      } else {
        await fetchDisputesByTransaction(transactionId);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  return { disputes, loading, error, fetchDisputesByTransaction, createDispute };
};