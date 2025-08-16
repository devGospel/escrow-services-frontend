'use client'
import { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hook/useAuth';

interface FormData {
  email: string;
  phone: string;
  password: string;
  role: 'buyer' | 'seller';
  business_verification?: string;
}

export default function SignupPage() {
  const { register, isLoading, error, success } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    password: '',
    role: 'buyer',
    business_verification: ''
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    try {
      const result = await register(formData);
      if (result) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      setLocalError('An unexpected error occurred');
    }
  };
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
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">Features</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">How It Works</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">Support</a>
        </nav>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition"
        >
          <Link href="/login">Log In</Link>
        </motion.button>
      </header>

      {/* Signup Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-3xl p-8 shadow-xl"
          >
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Sign Up for EscrowSecure</h1>
            
            {(success || error) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mb-6 p-4 rounded-lg text-center ${
                  error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {error || success}
              </motion.div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-blue-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-blue-700 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="\+234[0-9]{10}"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                  placeholder="+2341234567890"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-blue-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-blue-700 font-medium mb-2">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>

              {formData.role === 'seller' && (
                <div>
                  <label htmlFor="business_verification" className="block text-blue-700 font-medium mb-2">Business Verification (CAC Number)</label>
                  <input
                    type="text"
                    id="business_verification"
                    name="business_verification"
                    value={formData.business_verification}
                    onChange={handleChange}
                    required={formData.role === 'seller'}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                    placeholder="Enter your CAC number"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-blue-900 transition flex items-center justify-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCheckCircle className="mr-2" /> {isLoading ? 'Signing Up...' : 'Sign Up'}
              </motion.button>
            </div>

            <p className="text-center text-blue-700 mt-6">
              Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log In</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}