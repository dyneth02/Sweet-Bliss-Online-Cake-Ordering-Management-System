import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, AtSign, ShoppingBag, LogOut, Gift } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
    const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
    const [hasSpunWheel, setHasSpunWheel] = useState(false);

    useEffect(() => {
        const checkLoyaltyEligibility = async () => {
            if (user?.email) {
                try {
                    const response = await fetch(`http://localhost:8000/customer/completed-orders-count/${encodeURIComponent(user.email)}`);
                    const data = await response.json();
                    
                    if (data.success) {
                        setCompletedOrdersCount(data.count);
                        // Check if user has already spun the wheel
                        const hasSpun = localStorage.getItem(`wheelSpun_${user.email}`);
                        setHasSpunWheel(!!hasSpun);
                        
                        // Show modal if eligible and hasn't spun
                        if (data.count >= 5 && !hasSpun) {
                            setShowLoyaltyModal(true);
                        }
                    }
                } catch (error) {
                    console.error('Error checking loyalty eligibility:', error);
                }
            }
        };

        checkLoyaltyEligibility();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleViewOrders = () => {
        if (user) {
            navigate('/myorders');
        } else {
            navigate('/login', { state: { from: '/myorders' } });
        }
    };

    const handleNavigateToLoyalty = () => {
        navigate('/loyalty');
        setShowLoyaltyModal(false);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <motion.div
                className="max-w-7xl mx-auto px-4 py-8 space-y-6 mt-20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Profile Header */}
                <div className="text-center mb-12">
                    <div className="w-32 h-32 bg-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        {user?.profilePicture ? (
                            <img 
                                src={user.profilePicture} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-pink-600" />
                        )}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">
                        {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                    </h1>
                    {user && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="mt-4 flex items-center mx-auto px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </motion.button>
                    )}
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-pink-600 mb-6">Profile Information</h2>
                    
                    {user ? (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <User className="w-6 h-6 text-pink-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="text-lg text-gray-800">{`${user.firstName} ${user.lastName}`}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <AtSign className="w-6 h-6 text-pink-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Username</p>
                                    <p className="text-lg text-gray-800">{user.username}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <Mail className="w-6 h-6 text-pink-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-lg text-gray-800">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Phone className="w-6 h-6 text-pink-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="text-lg text-gray-800">{user.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <MapPin className="w-6 h-6 text-pink-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-lg text-gray-800">{user.address}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-600">Please log in to view your profile information</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                            >
                                Log In
                            </button>
                        </div>
                    )}
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-pink-600">Your Orders</h2>
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleViewOrders}
                                className="flex items-center px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                View Orders
                            </motion.button>
                            {completedOrdersCount >= 5 && !hasSpunWheel && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleNavigateToLoyalty}
                                    className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    <Gift className="w-5 h-5 mr-2" />
                                    Claim Reward
                                </motion.button>
                            )}
                        </div>
                    </div>
                    
                    <p className="text-gray-600">
                        {user 
                            ? "View and track all your cake orders in one place."
                            : "Log in to view your order history."}
                    </p>
                </div>
            </motion.div>

            {/* Loyalty Modal */}
            <AnimatePresence>
                {showLoyaltyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative"
                        >
                            <div className="text-center">
                                <Gift className="w-16 h-16 text-pink-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Congratulations! 🎉
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    You've completed 5 orders! You've earned a chance to spin the wheel of loyalty and win exciting rewards.
                                </p>
                                <div className="space-y-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNavigateToLoyalty}
                                        className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                    >
                                        Spin & Win
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowLoyaltyModal(false)}
                                        className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Maybe Later
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default ProfilePage;

