'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaUserEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hook/useAuth';
import { BASEURL } from '@/constants/api';

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    business_verification: user?.role === 'seller' ? user?.business_verification || '' : '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        phone: user.phone,
        business_verification: user.role === 'seller' ? user.business_verification || '' : '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${BASEURL}/users/${user?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          const result = await useAuth().refreshToken(refreshTokenValue);
          if (result) {
            const newResponse = await fetch(`${BASEURL}/users/${user?._id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: `Bearer ${result.access_token}`,
              },
              body: JSON.stringify(formData),
            });
            if (!newResponse.ok) throw new Error('Failed to update profile after token refresh');
            const updatedUser = await newResponse.json();
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setSuccess('Profile updated successfully!');
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } else if (!response.ok) {
        throw new Error('Failed to update profile');
      } else {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccess('Profile updated successfully!');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-3xl p-8 shadow-xl"
          >
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
              Update Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-blue-700 font-medium">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-blue-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-blue-700 font-medium">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-blue-200 rounded-lg"
                  required
                />
              </div>
              {user?.role === 'seller' && (
                <div>
                  <label htmlFor="business_verification" className="text-blue-700 font-medium">Business Verification (CAC)</label>
                  <input
                    id="business_verification"
                    name="business_verification"
                    type="text"
                    value={formData.business_verification}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-blue-200 rounded-lg"
                    required
                  />
                </div>
              )}
              {error && <p className="text-red-600">{error}</p>}
              {success && <p className="text-green-600">{success}</p>}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center w-full"
              >
                <FaUserEdit className="mr-2" /> {isSubmitting ? 'Updating...' : 'Update Profile'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}