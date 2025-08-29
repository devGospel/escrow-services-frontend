'use client'
import { useState, useCallback } from 'react';
import { BASEURL } from '@/constants/api';
import { useEscrows } from './useEscrows';

interface Order {
  _id: string;
  productId: { _id: string; name: string; price: number };
  buyerId: string;
  sellerId: string;
  amount: number;
  quantity: number;
  escrowId: string;
  status: string;
  trackingNumber?: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createEscrow } = useEscrows();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBuyerOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/orders/buyer`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch buyer orders');
      const data = await response.json();
      setOrders(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSellerOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/orders/seller`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch seller orders');
      const data = await response.json();
      setOrders(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (order: Omit<Order, '_id' | 'sellerId' | 'amount' | 'status' | 'trackingNumber'>) => {
    setLoading(true);
    try {
      const escrow = await createEscrow({
        buyerId: order.buyerId,
        amount: 0, // Will be updated by backend
        productId: order.productId._id,
        status: 'pending',
      });
      const response = await fetch(`${BASEURL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...order, escrowId: escrow._id }),
      });
      if (!response.ok) throw new Error('Failed to create order');
      const data = await response.json();
      setOrders((prev) => [...prev, data]);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createEscrow]);

  const updateOrder = useCallback(async (id: string, update: Partial<Order>) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(update),
      });
      if (!response.ok) throw new Error('Failed to update order');
      const data = await response.json();
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { orders, loading, error, fetchOrders, fetchBuyerOrders, fetchSellerOrders, createOrder, updateOrder };
};