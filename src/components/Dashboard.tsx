'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaShoppingCart, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hook/useAuth';
import { useTransactions } from '@/hook/useTransactions';
import { useEscrows } from '@/hook/useEscrows';
import { useDisputes } from '@/hook/useDisputes';

interface Listing {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { transactions, loading: txLoading, updateTransaction } = useTransactions();
  const { escrows, fetchEscrowByTransaction, updateEscrow } = useEscrows();
  const { disputes, fetchDisputesByTransaction, createDispute } = useDisputes();
  const router = useRouter();
  const [disputeReason, setDisputeReason] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [listings] = useState<Listing[]>([
    { id: '1', name: 'Product X', price: 5000, stock: 10 },
    { id: '2', name: 'Product Y', price: 3000, stock: 5 },
  ]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleInitiateDispute = async (transactionId: string) => {
    if (disputeReason) {
      await createDispute(transactionId, disputeReason);
      setDisputeReason('');
      setSelectedTransaction(null);
    }
  };

  const handleUpdateDispatch = async (transactionId: string) => {
    const tracking = prompt('Enter tracking number:');
    if (tracking) {
      await updateTransaction(transactionId, { tracking_number: tracking, status: 'dispatched' });
    }
  };

  const handleConfirmReceipt = async (transactionId: string, escrowId: string) => {
    await updateEscrow(escrowId, { status: 'released', release_date: new Date().toISOString() });
    await updateTransaction(transactionId, { status: 'completed' });
  };


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
          <Link href="/transactions" className="text-blue-800 hover:text-blue-600 transition">Transactions</Link>
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
              {user?.role === 'buyer' ? 'Buyer Dashboard' : 'Seller Dashboard'}
            </h1>

            <div className="space-y-4">
              <p className="text-blue-700">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-blue-700">
                <strong>Phone:</strong> {user?.phone}
              </p>
              {user?.role === 'seller' && user?.business_verification && (
                <p className="text-blue-700">
                  <strong>Business Verification (CAC):</strong> {user.business_verification}
                </p>
              )}
            </div>

            {user?.role === 'buyer' ? (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Your Transactions</h2>
                <div className="flex justify-center mb-4">
                  <Link href="/products">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <FaShoppingCart className="mr-2" /> Browse Products
                    </motion.button>
                  </Link>
                </div>
                {txLoading ? (
                  <p className="text-blue-700">Loading transactions...</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="border-b border-blue-100 pb-4">
                        <p className="text-blue-700"><strong>Product:</strong> {tx.product}</p>
                        <p className="text-blue-700"><strong>Amount:</strong> ₦{tx.amount}</p>
                        <p className="text-blue-700"><strong>Status:</strong> {tx.status}</p>
                        <p className="text-blue-700"><strong>Escrow Status:</strong> {escrows[tx.id]?.status || 'Loading...'}</p>
                        {tx.tracking_number && (
                          <p className="text-blue-700"><strong>Tracking:</strong> {tx.tracking_number}</p>
                        )}
                        {tx.status === 'dispatched' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirmReceipt(tx.id, tx.escrow_id!)}
                            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                          >
                            Confirm Receipt
                          </motion.button>
                        )}
                        {tx.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTransaction(tx.id)}
                            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                          >
                            <FaExclamationTriangle className="mr-2" /> Initiate Dispute
                          </motion.button>
                        )}
                        {selectedTransaction === tx.id && (
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
                              onClick={() => handleInitiateDispute(tx.id)}
                              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                              Submit Dispute
                            </motion.button>
                          </div>
                        )}
                        {disputes[tx.id]?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-blue-700"><strong>Disputes:</strong></p>
                            {disputes[tx.id].map((dispute) => (
                              <p key={dispute.id} className="text-blue-700">
                                {dispute.reason} - {dispute.status}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Your Listings</h2>
                <div className="flex justify-center mb-4">
                  <Link href="/listings/new">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <FaPlus className="mr-2" /> Add New Listing
                    </motion.button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border-b border-blue-100 pb-4">
                      <p className="text-blue-700"><strong>Name:</strong> {listing.name}</p>
                      <p className="text-blue-700"><strong>Price:</strong> ₦{listing.price}</p>
                      <p className="text-blue-700"><strong>Stock:</strong> {listing.stock}</p>
                    </div>
                  ))}
                </div>
                <h2 className="text-xl font-semibold text-blue-900 mt-8 mb-4">Your Orders</h2>
                {txLoading ? (
                  <p className="text-blue-700">Loading transactions...</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="border-b border-blue-100 pb-4">
                        <p className="text-blue-700"><strong>Product:</strong> {tx.product}</p>
                        <p className="text-blue-700"><strong>Amount:</strong> ₦{tx.amount}</p>
                        <p className="text-blue-700"><strong>Status:</strong> {tx.status}</p>
                        <p className="text-blue-700"><strong>Escrow Status:</strong> {escrows[tx.id]?.status || 'Loading...'}</p>
                        {tx.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateDispatch(tx.id)}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                          >
                            Update Dispatch Status
                          </motion.button>
                        )}
                        {disputes[tx.id]?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-blue-700"><strong>Disputes:</strong></p>
                            {disputes[tx.id].map((dispute) => (
                              <p key={dispute.id} className="text-blue-700">
                                {dispute.reason} - {dispute.status}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}