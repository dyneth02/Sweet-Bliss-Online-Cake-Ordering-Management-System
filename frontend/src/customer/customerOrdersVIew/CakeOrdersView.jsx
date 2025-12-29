import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Truck, Eye, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import OrderDetailsModal from '../admin/components/OrderDetailsModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

const statusColors = {
    pending: 'bg-yellow-400',
    processing: 'bg-purple-400',
    completed: 'bg-blue-500',
};

const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    processing: <Clock className="w-4 h-4 text-purple-500" />,
    completed: <CheckCircle className="w-4 h-4 text-blue-500" />,
};

const statusTextColors = {
    pending: 'text-yellow-600',
    processing: 'text-purple-600',
    completed: 'text-blue-600',
};

const CakeOrdersView = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = localStorage.getItem('user');
    const userEmail = user ? JSON.parse(user).email : null;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const encodedEmail = encodeURIComponent(userEmail);
                const response = await fetch(`http://localhost:8000/customer/myorders/${encodedEmail}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await response.json();
                setOrders(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userEmail) {
            fetchOrders();
        } else {
            setError("Please log in to view your orders");
            setLoading(false);
        }
    }, [userEmail]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getItemsPreview = (items) => {
        return (
            <div className="flex flex-col space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <img
                            src={item.itemType === 'CakeItem' ? 
                                `http://localhost:8000${item.imageUrl}` : 
                                item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`
                            }
                            alt={item.itemType === 'CakeItem' ? 'Custom Cake' : item.itemName}
                            className="w-10 h-10 object-cover rounded-md shadow-sm"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                            }}
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                                {item.itemType === 'CakeItem' ? 
                                    `Custom ${item.baseTypeOfCake}` : 
                                    item.itemName
                                }
                            </p>
                            <p className="text-xs text-gray-500">
                                Qty: {item.quantity} × Rs. {item.price}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleTrackOrder = (order) => {
        // Implement tracking functionality
        console.log('Tracking order:', order._id);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <>
            <Header />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="min-h-screen w-full bg-gradient-to-br from-rose-50 to-white px-40 pt-28"
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-6 mb-8 border border-pink-100"
                >
                    <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        My Orders
                    </h1>
                </motion.div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading your orders...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white rounded-xl shadow-md border border-pink-100 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-pink-50 to-rose-50 text-gray-700">
                                        <th className="py-4 px-6 text-left">Order Details</th>
                                        <th className="py-4 px-6 text-left">Items</th>
                                        <th className="py-4 px-6 text-left">Total</th>
                                        <th className="py-4 px-6 text-center">Status</th>
                                        <th className="py-4 px-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pink-50">
                                    {orders.map((order, index) => (
                                        <motion.tr
                                            key={order._id}
                                            variants={itemVariants}
                                            className={index % 2 === 0 ? 'bg-white' : 'bg-rose-50/30'}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800">
                                                        Order #{order._id.substring(order._id.length - 6)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(order.created_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getItemsPreview(order.items)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-medium text-gray-800">
                                                    Rs. {order.total_price}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {statusIcons[order.status]}
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusTextColors[order.status]} bg-opacity-10 capitalize`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleViewOrder(order)}
                                                        className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </motion.button>
                                                    
                                                    {order.status === 'pending' && order.items.some(item => 
                                                        item.itemType === 'CakeItem' && item.pickupOption === 'Delivery'
                                                    ) && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleTrackOrder(order)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                                        >
                                                            <MapPin className="w-4 h-4" />
                                                            Track Order
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {selectedOrder && (
                    <OrderDetailsModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedOrder(null);
                        }}
                        order={selectedOrder}
                    />
                )}
            </motion.div>
            <Footer />
        </>
    );
};

export default CakeOrdersView;
