'use client'
import { useState, useCallback } from 'react';
import { BASEURL } from '@/constants/api';
import { useAuth } from './useAuth';

interface Escrow {
  _id: string;
  buyerId: string;
  amount: number;
  productId: string;
  status: string;
  release_date?: string;
  transactionId?: string;
}

export const useEscrows = () => {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshToken } = useAuth();

  const fetchEscrows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/escrows`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          const result = await refreshToken(refreshTokenValue);
          if (result) {
            const retryResponse = await fetch(`${BASEURL}/escrows`, {
              headers: {
                Authorization: `Bearer ${result.access_token}`,
              },
            });
            if (!retryResponse.ok) throw new Error('Failed to fetch escrows after token refresh');
            const data = await retryResponse.json();
            setEscrows(data);
            return data;
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      }

      if (!response.ok) throw new Error('Failed to fetch escrows');
      const data = await response.json();
      setEscrows(data);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  const fetchEscrowById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/escrows/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          const result = await refreshToken(refreshTokenValue);
          if (result) {
            const retryResponse = await fetch(`${BASEURL}/escrows/${id}`, {
              headers: {
                Authorization: `Bearer ${result.access_token}`,
              },
            });
            if (!retryResponse.ok) throw new Error('Failed to fetch escrow after token refresh');
            const data = await retryResponse.json();
            setEscrows((prev) => [...prev.filter((e) => e._id !== id), data]);
            return data;
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      }

      if (!response.ok) throw new Error('Failed to fetch escrow');
      const data = await response.json();
      setEscrows((prev) => [...prev.filter((e) => e._id !== id), data]);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  const fetchEscrowByTransaction = useCallback(async (transactionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/escrows/transaction/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          const result = await refreshToken(refreshTokenValue);
          if (result) {
            const retryResponse = await fetch(`${BASEURL}/escrows/transaction/${transactionId}`, {
              headers: {
                Authorization: `Bearer ${result.access_token}`,
              },
            });
            if (!retryResponse.ok) throw new Error('Failed to fetch escrow by transaction after token refresh');
            const data = await retryResponse.json();
            setEscrows((prev) => [...prev.filter((e) => e.transactionId !== transactionId), data]);
            return data;
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      }

      if (!response.ok) throw new Error('Failed to fetch escrow by transaction');
      const data = await response.json();
      setEscrows((prev) => [...prev.filter((e) => e.transactionId !== transactionId), data]);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  const createEscrow = useCallback(
    async (escrow: Omit<Escrow, '_id' | 'release_date' | 'transactionId'>) => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const response = await fetch(`${BASEURL}/escrows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(escrow),
        });

        if (response.status === 401) {
          const refreshTokenValue = localStorage.getItem('refresh_token');
          if (refreshTokenValue) {
            const result = await refreshToken(refreshTokenValue);
            if (result) {
              const retryResponse = await fetch(`${BASEURL}/escrows`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${result.access_token}`,
                },
                body: JSON.stringify(escrow),
              });
              if (!retryResponse.ok) throw new Error('Failed to create escrow after token refresh');
              const data = await retryResponse.json();
              setEscrows((prev) => [...prev, data]);
              return data;
            } else {
              throw new Error('Token refresh failed');
            }
          } else {
            throw new Error('No refresh token available');
          }
        }

        if (!response.ok) throw new Error('Failed to create escrow');
        const data = await response.json();
        setEscrows((prev) => [...prev, data]);
        return data;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshToken]
  );

  const updateEscrow = useCallback(
    async (id: string, update: Partial<Pick<Escrow, 'status' | 'release_date'>>) => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const response = await fetch(`${BASEURL}/escrows/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(update),
        });

        if (response.status === 401) {
          const refreshTokenValue = localStorage.getItem('refresh_token');
          if (refreshTokenValue) {
            const result = await refreshToken(refreshTokenValue);
            if (result) {
              const retryResponse = await fetch(`${BASEURL}/escrows/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${result.access_token}`,
                },
                body: JSON.stringify(update),
              });
              if (!retryResponse.ok) throw new Error('Failed to update escrow after token refresh');
              const data = await retryResponse.json();
              setEscrows((prev) => prev.map((e) => (e._id === id ? data : e)));
              return data;
            } else {
              throw new Error('Token refresh failed');
            }
          } else {
            throw new Error('No refresh token available');
          }
        }

        if (!response.ok) throw new Error('Failed to update escrow');
        const data = await response.json();
        setEscrows((prev) => prev.map((e) => (e._id === id ? data : e)));
        return data;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshToken]
  );

  return {
    escrows,
    loading,
    error,
    fetchEscrows,
    fetchEscrowById,
    fetchEscrowByTransaction,
    createEscrow,
    updateEscrow,
  };
};