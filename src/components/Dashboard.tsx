'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hook/useAuth';

export default function DashboardPage() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <p className="text-blue-900 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 opacity-5 -z-10 pointer-events-none">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="bg-blue-200 rounded-sm" />
        ))}
      </div>

      {/* Header */}
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
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">Transactions</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">Support</a>
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

      {/* Dashboard Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-3xl p-8 shadow-xl"
          >
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
              Welcome, {user?.email}!
            </h1>

            <div className="space-y-4">
              <p className="text-blue-700">
                <strong>Role:</strong> {user?.role === 'buyer' ? 'Buyer' : 'Seller'}
              </p>
              <p className="text-blue-700">
                <strong>Phone:</strong> {user?.phone}
              </p>
              {user?.role === 'seller' && user?.business_verification && (
                <p className="text-blue-700">
                  <strong>Business Verification (CAC):</strong> {user.business_verification}
                </p>
              )}
              
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  {user?.role === 'buyer' ? 'Your Transactions' : 'Your Listings'}
                </h2>
                <p className="text-blue-700">
                  {user?.role === 'buyer'
                    ? 'View your ongoing and completed transactions here.'
                    : 'Manage your product listings and escrow agreements here.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}