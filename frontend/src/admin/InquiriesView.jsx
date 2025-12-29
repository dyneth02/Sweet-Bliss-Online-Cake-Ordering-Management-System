import { useState, useEffect } from 'react';
import { MessageCircle, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8000";

const InquiriesView = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/admin/contact`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch inquiries');
            const data = await response.json();
            if (data.success) {
                setInquiries(data.data);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/contact/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');
            const data = await response.json();
            
            if (data.success) {
                setInquiries(inquiries.map(inquiry => 
                    inquiry._id === id ? { ...inquiry, status: newStatus } : inquiry
                ));
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2";
        switch (status) {
            case 'pending':
                return (
                    <span className={`${baseClasses} bg-yellow-500/10 text-yellow-500 border border-yellow-500/20`}>
                        <Clock size={14} />
                        Pending
                    </span>
                );
            case 'responded':
                return (
                    <span className={`${baseClasses} bg-blue-500/10 text-blue-500 border border-blue-500/20`}>
                        <CheckCircle size={14} />
                        Responded
                    </span>
                );
            case 'resolved':
                return (
                    <span className={`${baseClasses} bg-green-500/10 text-green-500 border border-green-500/20`}>
                        <CheckCircle size={14} />
                        Resolved
                    </span>
                );
            default:
                return status;
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => 
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Inquiries</h1>
                    <p className="text-gray-400">Manage and respond to user inquiries</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search inquiries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pl-10 
                                     focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
                                     placeholder-gray-500 w-64"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
                    {error}
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 backdrop-blur-sm overflow-x-auto"
                >
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                <th className="py-4 px-6 text-left">Name</th>
                                <th className="py-4 px-6 text-left">Email</th>
                                <th className="py-4 px-6 text-left">Subject</th>
                                <th className="py-4 px-6 text-left">Message</th>
                                <th className="py-4 px-6 text-left">Date</th>
                                <th className="py-4 px-6 text-left">Status</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInquiries.map((inquiry) => (
                                <tr 
                                    key={inquiry._id}
                                    className="border-b border-gray-700/50 hover:bg-gray-700/20"
                                >
                                    <td className="py-4 px-6">{inquiry.name}</td>
                                    <td className="py-4 px-6">{inquiry.email}</td>
                                    <td className="py-4 px-6">{inquiry.subject}</td>
                                    <td className="py-4 px-6">
                                        <div className="max-w-xs truncate">{inquiry.message}</div>
                                    </td>
                                    <td className="py-4 px-6">{formatDate(inquiry.createdAt)}</td>
                                    <td className="py-4 px-6">
                                        {getStatusBadge(inquiry.status)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center space-x-2">
                                            <select
                                                value={inquiry.status}
                                                onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1
                                                         focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
                                                         text-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="responded">Responded</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}
        </div>
    );
};

export default InquiriesView; 