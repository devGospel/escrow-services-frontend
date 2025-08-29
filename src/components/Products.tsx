'use client'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaImage } from 'react-icons/fa';
import { useAuth } from '@/hook/useAuth';
import { useProducts } from '@/hook/useProducts';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export default function ProductsPage() {
  const { user, logout, isLoading: authLoading, isAuthenticated, getCurrentUser } = useAuth();
  const { products, loading, error, fetchSellerProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const cloudinaryWidgetRef = useRef<any>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false); // Track if fetchSellerProducts has been called

  useEffect(() => {
    const verifyUser = async () => {
      // Skip if already fetched or loading
      if (hasFetchedRef.current || loading) return;

      hasFetchedRef.current = true;
      try {
        if (isAuthenticated && user?.role === 'seller') {
          await fetchSellerProducts();
        } else {
          const currentUser = await getCurrentUser();
          if (currentUser?.role === 'seller') {
            await fetchSellerProducts();
          }
        }
      } catch (err) {
        console.error('Error verifying user:', err);
      }
    };

    verifyUser();
  }, [isAuthenticated, user?.role, fetchSellerProducts, getCurrentUser, loading]);

  useEffect(() => {
    // Initialize Cloudinary Upload Widget
    if (typeof window !== 'undefined' && window.cloudinary) {
      cloudinaryWidgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
          maxFileSize: 5000000, // 5MB limit
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            setFormData((prev) => ({ ...prev, imageUrl: result.info.secure_url }));
            setUploadError(null);
          } else if (error) {
            setUploadError(error.message || 'Failed to upload image to Cloudinary');
          }
        }
      );
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const openModal = (product?: ProductForm & { _id?: string }) => {
    if (product && product._id) {
      setEditingProduct(product._id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
    }
    setUploadError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
    setUploadError(null);
  };

  const handleImageUpload = () => {
    if (cloudinaryWidgetRef.current) {
      cloudinaryWidgetRef.current.open();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (cloudinaryWidgetRef.current) {
      cloudinaryWidgetRef.current.open();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct, formData);
      } else {
        await createProduct(formData);
      }
      closeModal();
      hasFetchedRef.current = false; // Allow refetching after product changes
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        hasFetchedRef.current = false; // Allow refetching after deletion
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <p className="text-blue-900 text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-lg border border-blue-200 rounded-3xl p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Access Denied</h2>
          <p className="text-blue-700 mb-6">You must be a seller to access this page.</p>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-2 rounded-xl font-medium shadow-md"
            >
              Go to Login
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-2 opacity-10 -z-10 pointer-events-none">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="bg-blue-300 rounded-full" />
        ))}
      </div>

      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl mr-3 shadow-lg">
            E$
          </div>
          <span className="text-2xl font-extrabold text-blue-900 tracking-tight">EscrowSecure</span>
        </motion.div>
        
        <nav className="hidden md:flex space-x-10">
          <Link href="/" className="text-blue-800 hover:text-blue-600 font-medium transition-colors">Home</Link>
          <Link href="/dashboard" className="text-blue-800 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
          <Link href="/products" className="text-blue-800 hover:text-blue-600 font-bold transition-colors">Products</Link>
          <Link href="/transactions" className="text-blue-800 hover:text-blue-600 font-medium transition-colors">Transactions</Link>
          <Link href="/support" className="text-blue-800 hover:text-blue-600 font-medium transition-colors">Support</Link>
        </nav>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:from-blue-800 hover:to-blue-950 transition flex items-center"
        >
          <FaSignOutAlt className="mr-2" /> Log Out
        </motion.button>
      </header>

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="bg-white/95 backdrop-blur-xl border border-blue-200/50 rounded-3xl p-10 shadow-2xl"
          >
            <h1 className="text-4xl font-extrabold text-blue-900 mb-8 text-center tracking-tight">Your Products</h1>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100/80 text-red-800 p-4 rounded-xl mb-8 shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="flex justify-center mb-10">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal()}
                className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-800 hover:to-blue-950 transition-all flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Product
              </motion.button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200/50 animate-pulse"
                  >
                    <div className="w-full h-56 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="flex justify-between mt-4 gap-3">
                      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-blue-800 text-center text-lg">No products found. Start by adding a new product!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50"
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-56 object-cover rounded-lg mb-4 shadow-sm"
                      />
                    )}
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">{product.name}</h3>
                    <p className="text-blue-700 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <p className="text-blue-800 font-medium">Price: ₦{product.price.toLocaleString()}</p>
                    <p className="text-blue-800 font-medium">Stock: {product.stock}</p>
                    <div className="flex justify-between mt-4 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(product)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                      >
                        <FaEdit className="mr-2" /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                      >
                        <FaTrash className="mr-2" /> Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl mx-4 md:mx-8 shadow-2xl border border-blue-200/50"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-800 font-medium">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/50 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-800 font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/50 transition"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-800 font-medium">Price (₦)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/50 transition"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-blue-800 font-medium">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/50 transition"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-blue-800 font-medium">Product Image (Optional)</label>
                <div
                  ref={dragAreaRef}
                  className={`w-full p-4 border-2 border-dashed rounded-lg text-center transition ${
                    isDragging ? 'border-blue-600 bg-blue-100' : 'border-blue-200 bg-blue-50/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FaImage className="mx-auto text-blue-600 text-2xl mb-2" />
                  <p className="text-blue-700">
                    {formData.imageUrl ? 'Image selected' : 'Drag & drop an image here or click to upload'}
                  </p>
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Upload Image
                  </button>
                </div>
                {uploadError && (
                  <p className="text-red-600 text-sm mt-2">{uploadError}</p>
                )}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-blue-900 px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-2 rounded-lg font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}