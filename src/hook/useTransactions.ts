import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { BASEURL } from '@/constants/api';

interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  product: string;
  escrow_id?: string;
  tracking_number?: string;
}

export const useTransactions = () => {
  const { user, isAuthenticated, refreshToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/transactions/user/${user._id}/${user.role}`, {
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
            const newResponse = await fetch(`${BASEURL}/transactions/user/${user._id}/${user.role}`, {
              headers: {
                Authorization: `Bearer ${result.access_token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });
            if (!newResponse.ok) throw new Error('Failed to fetch transactions after token refresh');
            const data = await newResponse.json();
            setTransactions(data);
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } else if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      } else {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, data: { status?: string; tracking_number?: string }) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          const result = await refreshToken(refreshTokenValue);
          if (result) {
            const newResponse = await fetch(`${BASEURL}/transactions/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: `Bearer ${result.access_token}`,
              },
              body: JSON.stringify(data),
            });
            if (!newResponse.ok) throw new Error('Failed to update transaction after token refresh');
            await fetchTransactions();
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } else if (!response.ok) {
        throw new Error('Failed to update transaction');
      } else {
        await fetchTransactions();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [isAuthenticated, user]);

  return { transactions, loading, error, fetchTransactions, updateTransaction };
};