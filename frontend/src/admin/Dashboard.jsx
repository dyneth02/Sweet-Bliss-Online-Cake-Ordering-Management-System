import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    ShoppingBag, 
    Package, 
    Cake, 
    BarChart3, 
    Bell,
    Sun,
    Moon,
    Plane,
    MessageSquare,
    Star,
    DollarSign,
    CakeSlice,
    TrendingUp,
    X,
    AlertTriangle,
    MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [isVacationMode, setIsVacationMode] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const navigate = useNavigate();
    const [recentFeedbacks, setRecentFeedbacks] = useState([]);
    const [feedbackError, setFeedbackError] = useState(null);
    const [reportedFeedbackCount, setReportedFeedbackCount] = useState(0);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [revenueData, setRevenueData] = useState({
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
        growth: 0
    });
    const [lowStockCount, setLowStockCount] = useState(0);
    const [inquiriesData, setInquiriesData] = useState({
        currentMonthInquiries: 0,
        previousMonthInquiries: 0,
        growth: 0
    });

    useEffect(() => {
        const fetchRecentFeedbacks = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/feedbacks/latest');
                if (!response.ok) throw new Error('Failed to fetch feedbacks');
                const result = await response.json();
                
                if (result.success) {
                    setRecentFeedbacks(result.data);
                } else {
                    throw new Error(result.message || 'Failed to fetch feedbacks');
                }
            } catch (err) {
                setFeedbackError(err.message);
                console.error('Error fetching feedbacks:', err);
            }
        };

        fetchRecentFeedbacks();
    }, []);

    useEffect(() => {
        const fetchReportedFeedbackCount = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/feedbacks/reported/count');
                if (!response.ok) throw new Error('Failed to fetch reported feedback count');
                const result = await response.json();
                
                if (result.success) {
                    setReportedFeedbackCount(result.count);
                }
            } catch (err) {
                console.error('Error fetching reported feedback count:', err);
            }
        };

        fetchReportedFeedbackCount();
    }, []);

    useEffect(() => {
        const fetchPendingOrdersCount = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/orders/pending/count');
                if (!response.ok) throw new Error('Failed to fetch pending orders count');
                const result = await response.json();
                
                if (result.success) {
                    setPendingOrdersCount(result.count);
                }
            } catch (err) {
                console.error('Error fetching pending orders count:', err);
            }
        };

        fetchPendingOrdersCount();
    }, []);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/monthly-revenue');
                if (!response.ok) throw new Error('Failed to fetch revenue data');
                const result = await response.json();
                
                if (result.success) {
                    setRevenueData(result.data);
                }
            } catch (err) {
                console.error('Error fetching revenue data:', err);
            }
        };

        fetchRevenueData();
    }, []);

    useEffect(() => {
        const fetchLowStockCount = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/inventory/low-stock/count');
                if (!response.ok) throw new Error('Failed to fetch low stock count');
                const result = await response.json();
                
                if (result.success) {
                    setLowStockCount(result.count);
                }
            } catch (err) {
                console.error('Error fetching low stock count:', err);
            }
        };

        fetchLowStockCount();
    }, []);

    useEffect(() => {
        const fetchInquiriesData = async () => {
            try {
                const response = await fetch('http://localhost:8000/contact');
                if (!response.ok) throw new Error('Failed to fetch inquiries data');
                const data = await response.json();
                
                if (data.success) {
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();
                    
                    const currentMonthInquiries = data.data.filter(inquiry => {
                        const inquiryDate = new Date(inquiry.createdAt);
                        return inquiryDate.getMonth() === currentMonth && 
                               inquiryDate.getFullYear() === currentYear;
                    }).length;

                    const previousMonthInquiries = data.data.filter(inquiry => {
                        const inquiryDate = new Date(inquiry.createdAt);
                        return inquiryDate.getMonth() === (currentMonth - 1) && 
                               inquiryDate.getFullYear() === currentYear;
                    }).length;

                    const growth = previousMonthInquiries === 0 ? 100 :
                        ((currentMonthInquiries - previousMonthInquiries) / previousMonthInquiries) * 100;

                    setInquiriesData({
                        currentMonthInquiries,
                        previousMonthInquiries,
                        growth: Number(growth.toFixed(2))
                    });
                }
            } catch (err) {
                console.error('Error fetching inquiries data:', err);
            }
        };

        fetchInquiriesData();
    }, []);

    useEffect(() => {
        const fetchVacationMode = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/vacation-mode');
                const data = await response.json();
                if (data.success) {
                    setIsVacationMode(data.isEnabled);
                }
            } catch (error) {
                console.error('Error fetching vacation mode:', error);
            }
        };

        fetchVacationMode();
    }, []);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
        }
    };

    // Mock data - replace with API calls
    const analyticsData = {
        currentMonthEarnings: 125800,    // Updated to realistic LKR amounts
        previousMonthEarnings: 102400,
        currentMonthCakes: 45,
        previousMonthCakes: 38,
        earningsGrowth: 22.85,
        cakesGrowth: 18.42,
        monthlyCakeTypes: {
            'Birthday': 20,
            'Wedding': 8,
            'Custom': 12,
            'Special': 5
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleVacationMode = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/vacation-mode', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setIsVacationMode(data.isEnabled);
            }
        } catch (error) {
            console.error('Error toggling vacation mode:', error);
        }
    };

    const BentoCard = ({ title, icon, description, onClick, className, metric, metricLabel }) => (
        <div 
            onClick={onClick}
            className={`p-6 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer
                hover:scale-[1.02] hover:shadow-xl
                ${className}
                ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white/90 hover:bg-gray-50'}
            `}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{icon}</div>
                {metric && (
                    <div className="text-right">
                        <div className="text-2xl font-bold">{metric}</div>
                        <div className="text-sm text-gray-400">{metricLabel}</div>
                    </div>
                )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    );

    const FeedbackCard = ({ feedback }) => (
        <div className={`p-4 rounded-lg mb-3 transition-all duration-300
            ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/80'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="font-semibold">{feedback.userName}</div>
                <div className="flex items-center">
                    {[...Array(feedback.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                    ))}
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-2">{feedback.description}</p>
            <div className="text-xs text-gray-500">{formatTimeAgo(feedback.createdAt)}</div>
        </div>
    );

    const AnalyticsCard = ({ title, value, icon, growth, metric }) => (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/80'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">{title}</span>
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
                {growth && (
                    <div className={`flex items-center text-sm ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={16} className={growth < 0 ? 'rotate-180' : ''} />
                        {Math.abs(growth)}%
                    </div>
                )}
            </div>
            {metric && <span className="text-sm text-gray-400">{metric}</span>}
        </div>
    );

    const NotificationModal = () => (
        <AnimatePresence>
            {showNotifications && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute right-0 top-16 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <button 
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-300"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Notifications Content */}
                    <div className="p-4 space-y-4">
                        {/* Pending Orders Notification */}
                        {pendingOrdersCount > 0 && (
                            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-purple-500/10 p-1.5 rounded">
                                        <ShoppingBag className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        Order Management
                                    </span>
                                </div>
                                
                                <div className="text-sm text-gray-300">
                                    <span className="font-semibold text-purple-400">{pendingOrdersCount}</span>
                                    {` pending ${pendingOrdersCount === 1 ? 'order requires' : 'orders require'} your attention`}
                                </div>
                                
                                <button
                                    onClick={() => {
                                        navigate('/admin/orders');
                                        setShowNotifications(false);
                                    }}
                                    className="mt-3 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200 transition-colors"
                                >
                                    View Pending Orders
                                </button>
                            </div>
                        )}

                        {/* Reported Feedback Notification */}
                        {reportedFeedbackCount > 0 && (
                            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-red-500/10 p-1.5 rounded">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span className="text-sm font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                        Feedback Management
                                    </span>
                                </div>
                                
                                <div className="text-sm text-gray-300">
                                    <span className="font-semibold text-red-400">{reportedFeedbackCount}</span>
                                    {` reported ${reportedFeedbackCount === 1 ? 'feedback requires' : 'feedbacks require'} your attention`}
                                </div>
                                
                                <button
                                    onClick={() => {
                                        navigate('/admin/feedbacks');
                                        setShowNotifications(false);
                                    }}
                                    className="mt-3 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200 transition-colors"
                                >
                                    View Reported Feedbacks
                                </button>
                            </div>
                        )}

                        {/* Low Stock Notification */}
                        {lowStockCount > 0 && (
                            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-yellow-500/10 p-1.5 rounded">
                                        <Package className="w-4 h-4 text-yellow-500" />
                                    </div>
                                    <span className="text-sm font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                        Inventory Alert
                                    </span>
                                </div>
                                
                                <div className="text-sm text-gray-300">
                                    <span className="font-semibold text-yellow-400">{lowStockCount}</span>
                                    {` ${lowStockCount === 1 ? 'item has' : 'items have'} low stock levels`}
                                </div>
                                
                                <button
                                    onClick={() => {
                                        navigate('/admin/inventory');
                                        setShowNotifications(false);
                                    }}
                                    className="mt-3 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200 transition-colors"
                                >
                                    View Inventory
                                </button>
                            </div>
                        )}

                        {/* No Notifications Message */}
                        {pendingOrdersCount === 0 && reportedFeedbackCount === 0 && lowStockCount === 0 && (
                            <div className="text-center text-gray-400 text-sm py-2">
                                No new notifications
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const totalNotifications = reportedFeedbackCount + pendingOrdersCount + lowStockCount;

    return (
        <div className={`min-h-screen p-8 transition-colors duration-300 
            ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Sweet Bliss Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full hover:bg-gray-700/50"
                    >
                        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-full hover:bg-gray-700/50 relative"
                        >
                            <Bell size={24} />
                            {totalNotifications > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                                    {totalNotifications}
                                </span>
                            )}
                        </button>
                        <NotificationModal />
                    </div>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Analytics Overview - Spans 2 columns */}
                <div className="col-span-full lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`col-span-full p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/90'}`}>
                        <h3 className="text-xl font-semibold mb-6">Analytics Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnalyticsCard
                                title="Monthly Revenue"
                                value={formatCurrency(revenueData.currentMonthRevenue)}
                                icon={<DollarSign className="text-green-500" size={24} />}
                                growth={revenueData.growth}
                                metric="vs last month"
                            />
                            <div onClick={() => navigate('/admin/inquiries')} className="cursor-pointer">
                                <AnalyticsCard
                                    title="User Inquiries"
                                    value={inquiriesData.currentMonthInquiries}
                                    icon={<MessageCircle className="text-blue-500" size={24} />}
                                    growth={inquiriesData.growth}
                                    metric="vs last month"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Feedback Section */}
                <div className={`row-span-2 p-6 rounded-xl overflow-hidden
                    ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/90'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Recent Feedback</h3>
                        <div className="flex items-center gap-2">
                            <MessageSquare 
                                className="text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => navigate('/admin/feedbacks')}
                            />
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {feedbackError ? (
                            <div className="text-red-400 text-sm">Error loading feedbacks</div>
                        ) : recentFeedbacks.length === 0 ? (
                            <div className="text-gray-400 text-sm">No feedbacks available</div>
                        ) : (
                            recentFeedbacks.map(feedback => (
                                <FeedbackCard key={feedback._id} feedback={feedback} />
                            ))
                        )}
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/admin/feedbacks')}
                            className="text-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
                        >
                            View All Feedbacks
                        </button>
                    </div>
                </div>

                {/* Vacation Mode Toggle */}
                <BentoCard
                    title="Vacation Mode"
                    icon={<Plane className={isVacationMode ? "text-green-500" : "text-gray-400"} />}
                    description={isVacationMode ? "Sweet Bliss is currently closed" : "Sweet Bliss is open"}
                    onClick={handleVacationMode}
                    className={isVacationMode ? "border-2 border-green-500/50" : ""}
                />

                {/* Customer Management */}
                <BentoCard
                    title="Customer Management"
                    icon={<Users className="text-blue-500" />}
                    description="Manage user accounts and permissions"
                    onClick={() => navigate('/admin/customers')}
                    metric="1,234"
                    metricLabel="Total Users"
                />

                {/* Order Management */}
                <BentoCard
                    title="Order Management"
                    icon={<ShoppingBag className="text-purple-500" />}
                    description="Track and manage customer orders"
                    onClick={() => navigate('/admin/orders')}
                    metric={pendingOrdersCount.toString()}
                    metricLabel="Active Orders"
                />

                {/* Inventory Management */}
                <BentoCard
                    title="Inventory Management"
                    icon={<Package className="text-orange-500" />}
                    description="Manage store products and stock levels"
                    onClick={() => navigate('/admin/inventory')}
                    metric={lowStockCount.toString()}
                    metricLabel="Low Stock Items"
                />

                {/* Cake Management */}
                <BentoCard
                    title="Cake Management"
                    icon={<Cake className="text-pink-500" />}
                    description="Manage custom cake orders and designs"
                    onClick={() => navigate('/admin/cakes')}
                    metric="45"
                    metricLabel="Custom Orders"
                />
            </div>

            {/* Add custom scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${isDarkMode ? '#1f2937' : '#f3f4f6'};
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? '#4b5563' : '#cbd5e1'};
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;













