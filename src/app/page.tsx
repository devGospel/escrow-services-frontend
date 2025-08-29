'use client'
import { useState, useEffect } from 'react';
import { FaLock, FaShieldAlt, FaMoneyBillWave, FaExchangeAlt, FaCheckCircle, FaHandHoldingUsd, FaPiggyBank, FaCoins } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [currentDemo, setCurrentDemo] = useState(0);
  const demos = [
    {
      title: "Secure Payment Holding",
      description: "Funds are safely held in escrow until both parties are satisfied",
      icon: <FaCoins className="text-blue-400 text-2xl" />
    },
    {
      title: "Dispute Resolution",
      description: "Neutral mediation when issues arise between buyers and sellers",
      icon: <FaShieldAlt className="text-blue-400 text-2xl" />
    },
    {
      title: "Guaranteed Payments",
      description: "Sellers get paid only after buyers confirm delivery",
      icon: <FaHandHoldingUsd className="text-blue-400 text-2xl" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    router.push('/signup');
  };
  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 opacity-5 -z-10 pointer-events-none">
        {Array.from({ length: 144 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-blue-200 rounded-sm"
          />
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
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">Features</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">How It Works</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">Pricing</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition">Support</a>
        </nav>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-900 transition"
        >
          Get Started
        </motion.button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight mb-6"
            >
              Secure eCommerce Transactions for Nigeria
            </motion.h1>
            
            <motion.p 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-blue-800 mb-8"
            >
              Our escrow platform protects both buyers and sellers by holding payments until goods are delivered as promised. Shop with confidence across Nigeria.
            </motion.p>
            
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-blue-900 transition flex items-center justify-center"
              >
                <FaExchangeAlt className="mr-2" /> Start a Transaction
              </button>
              <button 
               onClick={handleLogin}
              className="border border-blue-300 bg-white text-blue-700 px-8 py-3 rounded-lg font-medium shadow-sm hover:bg-blue-50 transition flex items-center justify-center">
                Login
              </button>
            </motion.div>
          </div>
          
          <div className="md:w-1/2 relative">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-full w-full bg-white/90 backdrop-blur-sm border border-blue-200 rounded-3xl overflow-hidden shadow-xl"
            >
              {/* App demo mockup */}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full mr-3 flex items-center justify-center">
                    <FaMoneyBillWave className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Transaction #NG-4892</div>
                    <div className="text-xs text-blue-600 flex items-center">
                      <IoMdTime className="mr-1" /> Active - Funds in Escrow
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 w-full h-48 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-blue-500 mb-2 text-4xl">
                      {demos[currentDemo].icon}
                    </div>
                    <h3 className="font-bold text-lg text-blue-900">{demos[currentDemo].title}</h3>
                    <p className="text-blue-700">{demos[currentDemo].description}</p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="text-sm text-blue-700">
                    <span className="font-semibold">Amount:</span> ₦45,000
                  </div>
                  <div className="text-sm text-blue-700">
                    <span className="font-semibold">Status:</span> Held
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {demos.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentDemo(index)}
                    className={`w-2 h-2 rounded-full ${currentDemo === index ? 'bg-blue-600' : 'bg-blue-200'}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-16">How EscrowSecure Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/90 p-8 rounded-xl shadow-sm hover:shadow-md transition backdrop-blur-sm border border-blue-100"
            >
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <FaMoneyBillWave className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-900">Buyer Makes Payment</h3>
              <p className="text-blue-700">Funds are securely held in our escrow account until delivery is confirmed.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/90 p-8 rounded-xl shadow-sm hover:shadow-md transition backdrop-blur-sm border border-blue-100"
            >
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <FaPiggyBank className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-900">Seller Ships Product</h3>
              <p className="text-blue-700">Seller is notified to dispatch the goods with tracking information.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/90 p-8 rounded-xl shadow-sm hover:shadow-md transition backdrop-blur-sm border border-blue-100"
            >
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <FaHandHoldingUsd className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-900">Funds Released</h3>
              <p className="text-blue-700">After buyer confirms receipt, payment is released to the seller.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Shop with Confidence?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of Nigerians who trust EscrowSecure for safe online transactions.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button 
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg shadow-xl hover:bg-blue-50 transition flex items-center mx-auto"
            >
              <FaCheckCircle className="mr-2" /> Get Started for Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg flex items-center justify-center text-white font-bold mr-2">
                  E$
                </div>
                <span className="text-xl font-bold text-white">EscrowSecure</span>
              </div>
              <p className="mb-4">Secure eCommerce transactions for Nigeria.</p>
              <p>© 2023 EscrowSecure. All rights reserved.</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Safety Center</a></li>
                <li><a href="#" className="hover:text-white transition">Dispute Resolution</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">NDPR Compliance</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}