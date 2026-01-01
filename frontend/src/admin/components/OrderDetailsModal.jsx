import React, { useEffect, useState } from 'react';
import { X, Package, User, Calendar, CreditCard, Clock, Cake, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderDetailsModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!isOpen || !order) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`http://localhost:8000/admin/orders/${order._id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch order details');
                }

                if (!data.success) {
                    throw new Error(data.message);
                }

                setOrderDetails(data.data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching order details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [isOpen, order]);

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const StatusBadge = ({ status }) => {
        const statusStyles = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            processing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            completed: 'bg-green-500/10 text-green-500 border-green-500/20',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                {status}
            </span>
        );
    };

    const renderCakeItem = (item) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-1">
                <img
                    src={`http://localhost:8000${item.imageUrl}`}
                    alt="Custom Cake"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
            </div>
            <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-semibold text-purple-400">
                        Custom {item.baseTypeOfCake}
                    </h4>
                    <p className="text-white font-medium">Rs.{item.price}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm">
                    <div>
                        <p><span className="text-gray-400">Event:</span> {item.natureOfEvent}</p>
                        <p><span className="text-gray-400">Size:</span> {item.cakeSize}</p>
                        <p><span className="text-gray-400">Pickup:</span> {item.pickupOption}</p>
                        <p><span className="text-gray-400">Required Date:</span> {formatDate(item.dateOfRequirement)}</p>
                    </div>
                    <div>
                        <p><span className="text-gray-400">Quantity:</span> {item.quantity}</p>
                        <p><span className="text-gray-400">Toppings:</span> {item.toppings.join(', ')}</p>
                        <p><span className="text-gray-400">Writing:</span> {item.writingsOnTop}</p>
                    </div>
                </div>
                {item.additionalNotes && (
                    <p className="text-sm text-gray-400">
                        <span className="font-medium">Notes:</span> {item.additionalNotes}
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    {item.baseColors.map((color, idx) => (
                        <div
                            key={idx}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            style={{ backgroundColor: color }}
                            title={`Color ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderInventoryItem = (item) => (
        <div className="flex items-center space-x-4">
            <img
                src={item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`}
                alt={item.itemName}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                }}
            />
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-semibold text-purple-400">{item.itemName}</h4>
                    <p className="text-white font-medium">Rs.{item.price}</p>
                </div>
                <p className="text-gray-300 text-sm">Quantity: {item.quantity}</p>
            </div>
        </div>
    );

    const handleStatusUpdate = async () => {
        if (!order._id) return;
        
        setUpdating(true);
        try {
            const response = await fetch(`http://localhost:8000/admin/orders/${order._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'completed' })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            const data = await response.json();
            if (data.success) {
                setOrderDetails(prev => ({
                    ...prev,
                    status: 'completed'
                }));
                onUpdateStatus(order._id);
                onClose();
            } else {
                throw new Error(data.message || 'Failed to update order status');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error updating order status:', err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-700"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-gray-900 p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Order Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-400 hover:text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && orderDetails && (
                        <>
                            {/* Order Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <User className="w-5 h-5 text-purple-500" />
                                        <span>{orderDetails.user_email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <Calendar className="w-5 h-5 text-purple-500" />
                                        <span>{formatDate(orderDetails.created_at)}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <Clock className="w-5 h-5 text-purple-500" />
                                        <StatusBadge status={orderDetails.status} />
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <CreditCard className="w-5 h-5 text-purple-500" />
                                        <span className="text-lg font-semibold">Rs.{orderDetails.total_price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Cakes */}
                            {orderDetails.items.some(item => item.itemType === 'CakeItem') && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <Cake className="w-5 h-5 mr-2 text-purple-500" />
                                        Custom Cakes
                                    </h3>
                                    <div className="space-y-6">
                                        {orderDetails.items
                                            .filter(item => item.itemType === 'CakeItem')
                                            .map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                                                >
                                                    {renderCakeItem(item)}
                                                </motion.div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Store Items */}
                            {orderDetails.items.some(item => item.itemType === 'InventoryItem') && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <ShoppingBag className="w-5 h-5 mr-2 text-purple-500" />
                                        Store Items
                                    </h3>
                                    <div className="space-y-4">
                                        {orderDetails.items
                                            .filter(item => item.itemType === 'InventoryItem')
                                            .map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                                                >
                                                    {renderInventoryItem(item)}
                                                </motion.div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-700 p-6 bg-gray-900">
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                        {orderDetails && orderDetails.status !== 'completed' && (
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating}
                                className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {updating ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : (
                                    'Mark as Completed'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OrderDetailsModal;


