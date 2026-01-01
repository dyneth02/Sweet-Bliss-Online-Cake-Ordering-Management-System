import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Truck, Trash2, Download, Eye, FileText } from 'lucide-react';
// XLSX is imported but the package isn't included in the allowed libraries
// If you need Excel export, you'll need to install this package
import * as XLSX from 'xlsx';
// framer-motion is imported but it's not in the allowed libraries list
// If you need animations, you'll need to install this package
import { motion } from 'framer-motion';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const statusColors = {
    pending: 'bg-yellow-400',
    processing: 'bg-purple-400',
    completed: 'bg-blue-500',
};

// Updated color scheme for a futuristic look
const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-400" />,
    processing: <Clock className="w-4 h-4 text-purple-400" />,
    completed: <CheckCircle className="w-4 h-4 text-blue-500" />,
};

// Status label mapping
const statusLabels = {
    Processing: 'In Progress',
    Shipped: 'On The Way',
    Completed: 'Delivered',
};

// Updated text colors with new futuristic theme
const statusTextColors = {
    pending: 'text-yellow-500',
    processing: 'text-purple-500',
    completed: 'text-blue-500',
};

const AdminOrdersView = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        key: 'created_at',
        direction: 'desc'
    });

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/orders');
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await response.json();
                setOrders(data);
                setFilteredOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Format date to local string
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

    // Calculate total items in an order
    const getTotalItems = (items) => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    // Get a preview of items
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
                            className="w-10 h-10 object-cover rounded-md"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                            }}
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {item.itemType === 'CakeItem' ? 
                                    `Custom ${item.baseTypeOfCake}` : 
                                    item.itemName
                                }
                            </p>
                            <p className="text-xs text-gray-500">
                                Qty: {item.quantity} × ${item.price}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Sorting function
    const sortData = (data, key, direction) => {
        return [...data].sort((a, b) => {
            switch (key) {
                case 'user_email':
                    return direction === 'asc' 
                        ? a.user_email.localeCompare(b.user_email)
                        : b.user_email.localeCompare(a.user_email);
                case 'status':
                    return direction === 'asc' 
                        ? a.status.localeCompare(b.status)
                        : b.status.localeCompare(a.status);
                case 'created_at':
                    return direction === 'asc' 
                        ? new Date(a.created_at) - new Date(b.created_at)
                        : new Date(b.created_at) - new Date(a.created_at);
                default:
                    return 0;
            }
        });
    };

    // Handle sort
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setFilteredOrders(sortData(filteredOrders, key, direction));
    };

    // Sort indicator component
    const SortIndicator = ({ sortKey }) => {
        if (sortConfig.key !== sortKey) {
            return <span className="ml-1 text-gray-400">↕</span>;
        }
        return (
            <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    // Filter orders based on date range
    const filterOrdersByDate = () => {
        if (!startDate && !endDate) {
            return orders;
        }

        return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            const formattedOrderDate = formatDate(orderDate);

            if (startDate && endDate) {
                return formattedOrderDate >= startDate && formattedOrderDate <= endDate;
            } else if (startDate) {
                return formattedOrderDate >= startDate;
            } else if (endDate) {
                return formattedOrderDate <= endDate;
            }
            return true;
        });
    };

    // Handle date filter changes
    useEffect(() => {
        const filtered = filterOrdersByDate();
        setFilteredOrders(sortData(filtered, sortConfig.key, sortConfig.direction));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, orders, sortConfig]);

    // Handle delete order
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            const response = await fetch(`http://localhost:8000/admin/orders/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete order');
            }

            // Remove the deleted order from state
            const updatedOrders = orders.filter(order => order._id !== orderId);
            setOrders(updatedOrders);
            setFilteredOrders(filteredOrders.filter(order => order._id !== orderId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateStatus = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:8000/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'completed' })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update the orders state to reflect the change
            const updatedOrders = orders.map(order => 
                order._id === orderId 
                    ? { ...order, status: 'completed' }
                    : order
            );
            setOrders(updatedOrders);
            setFilteredOrders(updatedOrders);
            
            // Close the modal
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    // Export table to Excel
    const exportToExcel = () => {
        if (!XLSX) {
            setError("Excel export library not available");
            return;
        }

        // Prepare data for export
        const exportData = filteredOrders.map(order => ({
            'Customer Email': order.user_email,
            'Order Items': order.items ? order.items.map(item => item.name).join(', ') : 'No items',
            'Total Price': `Rs.${order.total_price}`,
            'Status': statusLabels[order.status] || order.status,
            'Created At': formatDate(order.created_at)
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

        // Generate Excel file and download
        XLSX.writeFile(workbook, 'customer_orders.xlsx');
    };

    // Add exportToPDF function
    const exportToPDF = () => {
        // Create new document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(33, 150, 243); // Blue color
        doc.text('Sweet Bliss - Order Report', 14, 20);
        
        // Add timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Gray color
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Prepare table data
        const tableData = filteredOrders.map(order => [
            order.user_email,
            order.items ? order.items.map(item => 
                item.itemType === 'CakeItem' ? 
                    `Custom ${item.baseTypeOfCake}` : 
                    item.itemName
            ).join(', ') : 'No items',
            `Rs.${order.total_price}`,
            order.status,
            formatDate(order.created_at)
        ]);

        // Generate table
        autoTable(doc, {
            startY: 40,
            head: [['Customer Email', 'Order Items', 'Total Price', 'Status', 'Created At']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [33, 150, 243],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { top: 40 },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 60 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 30 }
            },
            didDrawPage: function(data) {
                // Add page number at the bottom
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        // Get the Y position after the table
        const finalY = doc.lastAutoTable.finalY || 40;

        // Add summary section
        const totalOrders = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_price), 0);
        const completedOrders = filteredOrders.filter(order => order.status.toLowerCase() === 'completed').length;
        const pendingOrders = filteredOrders.filter(order => order.status.toLowerCase() === 'pending').length;

        // Add summary with a box around it
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(250, 250, 250);
        doc.rect(14, finalY + 10, 180, 40, 'F');
        doc.setFillColor(33, 150, 243);
        doc.rect(14, finalY + 10, 180, 8, 'F');

        // Summary title
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('Order Summary', 20, finalY + 16);

        // Summary details
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Orders: ${totalOrders}`, 20, finalY + 28);
        doc.text(`Total Revenue: Rs.${totalRevenue.toFixed(2)}`, 20, finalY + 36);
        doc.text(`Completed Orders: ${completedOrders}`, 100, finalY + 28);
        doc.text(`Pending Orders: ${pendingOrders}`, 100, finalY + 36);

        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by Sweet Bliss Admin System', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

        // Save the PDF
        doc.save('sweet_bliss_orders.pdf');
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

    const headerVariants = {
        hidden: { opacity: 0, scale: 0.97 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
        }
    };

    // Check if motion is available, otherwise use div
    const MotionComponent = motion ? motion.div : 'div';
    const MotionButton = motion ? motion.button : 'button';
    const MotionInput = motion ? motion.input : 'input';
    const MotionTr = motion ? motion.tr : 'tr';
    const MotionLi = motion ? motion.li : 'li';
    const MotionSpan = motion ? motion.span : 'span';

    return (
        <MotionComponent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 px-8 pt-8"
        >
            <MotionComponent
                variants={headerVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-r from-purple-800 to-blue-700 text-white py-4 px-6 text-2xl font-bold shadow-lg mb-8 rounded-lg border border-purple-500/30 backdrop-blur-sm"
            >
                <MotionComponent
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    Customer Orders
                </MotionComponent>
            </MotionComponent>

            {loading && (
                <MotionComponent
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5
                    }}
                    className="text-blue-400 text-center text-lg"
                >
                    Loading orders...
                </MotionComponent>
            )}

            {error && (
                <MotionComponent
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-500 bg-red-900/20 p-4 rounded-md border border-red-500/30"
                >
                    Error: {error}
                </MotionComponent>
            )}

            <MotionComponent
                variants={headerVariants}
                initial="hidden"
                animate="visible"
                className="bg-gray-800/50 shadow-lg rounded-lg p-6 mb-6 flex flex-wrap gap-6 items-center backdrop-blur-sm border border-gray-700"
            >
                <div className="flex flex-col">
                    <label className="text-sm text-blue-300 mb-1">Start Date</label>
                    <MotionInput
                        whileFocus={{ scale: 1.02, boxShadow: "0 0 8px rgba(147, 51, 234, 0.5)" }}
                        transition={{ type: 'spring', stiffness: 500 }}
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-600 bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-blue-300 mb-1">End Date</label>
                    <MotionInput
                        whileFocus={{ scale: 1.02, boxShadow: "0 0 8px rgba(147, 51, 234, 0.5)" }}
                        transition={{ type: 'spring', stiffness: 500 }}
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-600 bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                </div>

                <div className="flex-grow flex justify-end space-x-4">
                    <MotionButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToExcel}
                        className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-md hover:from-teal-600 hover:to-blue-600 transition duration-200 flex items-center gap-2 shadow-lg"
                    >
                        <Download className="w-4 h-4" />
                        Export to Excel
                    </MotionButton>

                    <MotionButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToPDF}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-pink-600 transition duration-200 flex items-center gap-2 shadow-lg"
                    >
                        <FileText className="w-4 h-4" />
                        Export to PDF
                    </MotionButton>
                </div>
            </MotionComponent>

            {!loading && !error && (
                <MotionComponent
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="overflow-x-auto bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 backdrop-blur-sm"
                >
                    <table className="w-full table-auto text-left">
                        <thead>
                        <tr className="border-b border-gray-700 bg-gray-900/50 text-blue-300 uppercase text-sm leading-normal">
                            <th 
                                className="py-3 px-6 cursor-pointer hover:bg-gray-800/50"
                                onClick={() => handleSort('user_email')}
                            >
                                Customer Name
                                <SortIndicator sortKey="user_email" />
                            </th>
                            <th className="py-3 px-6">Order Items</th>
                            <th className="py-3 px-6">Order Price</th>
                            <th 
                                className="py-3 px-6 cursor-pointer hover:bg-gray-800/50"
                                onClick={() => handleSort('status')}
                            >
                                Status
                                <SortIndicator sortKey="status" />
                            </th>
                            <th 
                                className="py-3 px-6 cursor-pointer hover:bg-gray-800/50"
                                onClick={() => handleSort('created_at')}
                            >
                                Created At
                                <SortIndicator sortKey="created_at" />
                            </th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="text-gray-300 text-sm">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => (
                                <MotionTr
                                    key={order._id || order.id || index}
                                    variants={itemVariants}
                                    whileHover={{
                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                        transition: { duration: 0.2 }
                                    }}
                                    className={`border-b border-gray-700 ${
                                        index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                                    }`}
                                >
                                    <td className="py-4 px-6 whitespace-nowrap font-medium text-blue-300">
                                        {order.user_email}
                                    </td>

                                    {/* Render orderItems array */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        {getItemsPreview(order.items)}
                                    </td>

                                    <td className="py-4 px-6 whitespace-nowrap font-semibold text-purple-300">
                                        {`Rs. ${order.total_price}`}
                                    </td>

                                    {/* Status with icon, color indicator, and colored text */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-2">
                                            <MotionComponent
                                                animate={{ rotate: [0, 360] }}
                                                transition={{
                                                    repeat: 0,
                                                    duration: order.status === 'processing' ? 3 : 0,
                                                    ease: "linear"
                                                }}
                                            >
                                                {statusIcons[order.status]}
                                            </MotionComponent>
                                            <MotionSpan
                                                animate={{
                                                    boxShadow: order.status === 'processing' ?
                                                        ['0 0 0px rgba(167, 139, 250, 0)', '0 0 8px rgba(167, 139, 250, 0.8)', '0 0 0px rgba(167, 139, 250, 0)'] :
                                                        undefined
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 2
                                                }}
                                                className={`h-3 w-3 rounded-full ${statusColors[order.status] || 'bg-gray-600'}`}
                                            ></MotionSpan>
                                            <MotionSpan
                                                whileHover={{ scale: 1.05 }}
                                                className={`${statusTextColors[order.status] || 'text-gray-300'} font-medium capitalize`}
                                            >
                                                {order.status}
                                            </MotionSpan>
                                        </div>
                                    </td>

                                    <td className="py-4 px-6 whitespace-nowrap text-gray-400">
                                        {formatDate(order.created_at)}
                                    </td>

                                    <td className="py-4 px-6 whitespace-nowrap text-center flex justify-center space-x-2">
                                        <MotionButton
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleViewOrder(order)}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition duration-200 shadow-lg"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </MotionButton>

                                        {order.status === 'Processing' && (
                                            <MotionButton
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition duration-200 shadow-lg"
                                            >
                                                Track Order
                                            </MotionButton>
                                        )}
                                        {order.status === 'Shipped' && (
                                            <MotionButton
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-teal-700 hover:to-blue-700 transition duration-200 shadow-lg"
                                            >
                                                Track Order
                                            </MotionButton>
                                        )}
                                        {order.status === 'Completed' && (
                                            <span className="text-gray-500 italic mr-4">Delivered</span>
                                        )}

                                        {/* Delete button for all orders */}
                                        <MotionButton
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDeleteOrder(order._id || order.id)}
                                            className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-2 rounded-md hover:from-red-700 hover:to-pink-700 transition duration-200 shadow-lg"
                                            title="Delete Order"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </MotionButton>
                                    </td>
                                </MotionTr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-4 px-6 text-center text-gray-400">
                                    <MotionComponent
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        No orders found.
                                    </MotionComponent>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </MotionComponent>
            )}
            {selectedOrder && (
                <OrderDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedOrder(null);
                    }}
                    order={selectedOrder}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </MotionComponent>
    );
};

export default AdminOrdersView;
