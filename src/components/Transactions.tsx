'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hook/useAuth';
import { BASEURL } from '@/constants/api';

export default function CreateTransactionPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not authenticated or not a seller
  if (!authLoading && (!isAuthenticated || user?.role !== 'seller')) {
    router.push('/login');
    return null;
  }

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !amount || !buyerEmail) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const transactionData = {
        product: productName,
        amount: parseFloat(amount),
        buyer_email: buyerEmail,
        seller_id: user?._id // Using the authenticated seller's ID
      };

      const response = await fetch(`${BASEURL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Transaction created successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(result.message || 'Failed to create transaction');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Transaction creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
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
        
        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </motion.button>
        </Link>
      </header>

      <section className="container mx-auto px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-3xl p-8 shadow-xl"
          >
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
              Create New Transaction
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateTransaction}>
              <div className="mb-6">
                <label className="block text-blue-800 font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-blue-800 font-medium mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  min="1"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-blue-800 font-medium mb-2">
                  Buyer Email
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter buyer's email address"
                  required
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span>Creating Transaction...</span>
                ) : (
                  <>
                    <FaPlus className="mr-2" /> Create Transaction
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}