'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hook/useAuth';
import { useOrders } from '@/hook/useOrders';
import { useEscrows } from '@/hook/useEscrows';
import { useDisputes } from '@/hook/useDisputes';

export default function OrdersPage() {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { orders, loading, error, fetchBuyerOrders, fetchSellerOrders, updateOrder } = useOrders();
  const { updateEscrow } = useEscrows();
  const { createDispute } = useDisputes();
  const router = useRouter();
  const [disputeReason, setDisputeReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'buyer') {
      fetchBuyerOrders();
    } else {
      fetchSellerOrders();
    }
  }, [user, fetchBuyerOrders, fetchSellerOrders]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleUpdateDispatch = async (orderId: string) => {
    const trackingNumber = prompt('Enter tracking number:');
    if (trackingNumber) {
      try {
        await updateOrder(orderId, { trackingNumber, status: 'dispatched' });
      } catch (err) {
        // Error handled by useOrders hook
      }
    }
  };

  const handleConfirmReceipt = async (orderId: string, escrowId: string) => {
    try {
      await updateEscrow(escrowId, { status: 'released', release_date: new Date().toISOString() });
      await updateOrder(orderId, { status: 'completed' });
    } catch (err) {
      // Error handled by useOrders/useEscrows hooks
    }
  };

  const handleInitiateDispute = async (orderId: string) => {
    if (disputeReason) {
      try {
        await createDispute(orderId, disputeReason);
        setDisputeReason('');
        setSelectedOrder(null);
      } catch (err) {
        // Error handled by useDisputes hook
      }
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <p className="text-blue-900 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 opacity-5 -z-10 pointer-events-none">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="bg-blue-200 rounded-sm" />
        ))}
      </div>

      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold mr-2">
            E$
          </div>
          <span className="text-xl font-bold text-blue-900">EscrowSecure</span>
        </motion.div>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-blue-800 hover:text-blue-600 transition">Home</Link>
          <Link href="/dashboard" className="text-blue-800 hover:text-blue-600 transition">Dashboard</Link>
          <Link href="/profile" className="text-blue-800 hover:text-blue-600 transition">Profile</Link>
          <Link href="/products" className="text-blue-800 hover:text-blue-600 transition">Products</Link>
          <Link href="/orders" className="text-blue-800 hover:text-blue-600 transition">Orders</Link>
          <Link href="/support" className="text-blue-800 hover:text-blue-600 transition">Support</Link>
        </nav>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition flex items-center"
        >
          <FaSignOutAlt className="mr-2" /> Log Out
        </motion.button>
      </header>

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-3xl p-8 shadow-xl"
          >
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
              {user?.role === 'buyer' ? 'Your Orders' : 'Manage Orders'}
            </h1>

            {loading ? (
              <p className="text-blue-700">Loading orders...</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border-b border-blue-100 pb-4">
                    <p className="text-blue-700"><strong>Product:</strong> {order.productId.name}</p>
                    <p className="text-blue-700"><strong>Amount:</strong> ₦{order.amount}</p>
                    <p className="text-blue-700"><strong>Quantity:</strong> {order.quantity}</p>
                    <p className="text-blue-700"><strong>Status:</strong> {order.status}</p>
                    {order.trackingNumber && (
                      <p className="text-blue-700"><strong>Tracking:</strong> {order.trackingNumber}</p>
                    )}
                    {user?.role === 'buyer' && order.status === 'dispatched' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleConfirmReceipt(order._id, order.escrowId)}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        Confirm Receipt
                      </motion.button>
                    )}
                    {user?.role === 'buyer' && order.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedOrder(order._id)}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                      >
                        <FaExclamationTriangle className="mr-2" /> Initiate Dispute
                      </motion.button>
                    )}
                    {user?.role === 'seller' && order.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateDispatch(order._id)}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Update Dispatch Status
                      </motion.button>
                    )}
                    {selectedOrder === order._id && (
                      <div className="mt-2">
                        <textarea
                          className="w-full p-2 border border-blue-200 rounded-lg"
                          placeholder="Enter dispute reason..."
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInitiateDispute(order._id)}
                          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                          Submit Dispute
                        </motion.button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </motion.div>
        </div>
      </section>
    </div>
  );
}