import { useState, useEffect } from 'react';
import { Eye, X, AlertTriangle, AlertOctagon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Add this new component for the image preview
const ImagePreviewOverlay = ({ imageSrc, mousePosition }) => {
    if (!imageSrc || !mousePosition) return null;

    return (
        <motion.div 
            className="fixed z-50 pointer-events-none"
            style={{
                left: Math.max(mousePosition.x - 200, 20), // Center the preview above cursor
                top: Math.max(mousePosition.y - 420, 20), // Position above cursor with padding
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
        >
            <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700 bg-gray-900">
                <img 
                    src={imageSrc} 
                    alt="Preview"
                    className="max-w-[300px] max-h-[300px] object-cover"
                />
            </div>
        </motion.div>
    );
};

const AdminFeedbackView = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc'
    });
    // Add these new states for image preview
    const [previewImage, setPreviewImage] = useState(null);
    const [mousePosition, setMousePosition] = useState(null);

    // Add mouse position tracking
    const handleMouseMove = (event) => {
        setMousePosition({
            x: event.clientX,
            y: event.clientY
        });
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/feedbacks');
                if (!response.ok) throw new Error('Failed to fetch feedbacks');
                const data = await response.json();
                setFeedbacks(Array.isArray(data) ? data : []);
                setFilteredFeedbacks(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        return `http://localhost:8000${imagePath}`;
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedData = [...filteredFeedbacks].sort((a, b) => {
            if (key === 'createdAt') {
                return direction === 'asc' 
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
            }
            return direction === 'asc' 
                ? a[key].localeCompare(b[key])
                : b[key].localeCompare(a[key]);
        });
        setFilteredFeedbacks(sortedData);
    };

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

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        try {
            const response = await fetch(`http://localhost:8000/admin/feedbacks/${feedbackId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete feedback');

            setFeedbacks(feedbacks.filter(f => f._id !== feedbackId));
            setFilteredFeedbacks(filteredFeedbacks.filter(f => f._id !== feedbackId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusUpdate = async (feedbackId, status) => {
        try {
            const response = await fetch(`http://localhost:8000/admin/feedbacks/${feedbackId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updatedFeedbacks = feedbacks.map(feedback => 
                feedback._id === feedbackId ? { ...feedback, status } : feedback
            );
            setFeedbacks(updatedFeedbacks);
            setFilteredFeedbacks(updatedFeedbacks);
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const exportToExcel = () => {
        const exportData = filteredFeedbacks.map(feedback => ({
            'User Email': feedback.user_email,
            'Rating': feedback.rating,
            'Comment': feedback.comment,
            'Status': feedback.status,
            'Created At': formatDate(feedback.created_at),
            'Report Reason': feedback.reportReason || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');
        XLSX.writeFile(workbook, 'feedback_data.xlsx');
    };

    const handleClearReport = async (feedbackId) => {
        try {
            const response = await fetch(`http://localhost:8000/admin/feedbacks/${feedbackId}/clear-report`, {
                method: 'PUT',
            });

            if (!response.ok) throw new Error('Failed to clear report');

            const updatedFeedbacks = feedbacks.map(feedback => 
                feedback._id === feedbackId 
                    ? { ...feedback, isReported: false, reportDetails: { status: 'clean' } }
                    : feedback
            );
            
            setFeedbacks(updatedFeedbacks);
            setFilteredFeedbacks(updatedFeedbacks);
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-300">
            <h1 className="text-3xl font-bold mb-8 text-blue-300">Feedback Management</h1>

            {loading && <div className="text-blue-400">Loading...</div>}
            {error && <div className="text-red-400">{error}</div>}

            <AnimatePresence>
                <ImagePreviewOverlay 
                    imageSrc={previewImage} 
                    mousePosition={mousePosition}
                />
            </AnimatePresence>

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700">
                                <th 
                                    className="px-6 py-3 text-left cursor-pointer text-blue-300 hover:bg-gray-800/50"
                                    onClick={() => handleSort('user_email')}
                                >
                                    User Email
                                    <SortIndicator sortKey="user_email" />
                                </th>
                                <th className="px-6 py-3 text-left text-blue-300">Feedback Image</th>
                                <th className="px-6 py-3 text-center text-blue-300">Reported</th>
                                <th className="px-6 py-3 text-left text-blue-300">Description</th>
                                <th 
                                    className="px-6 py-3 text-left cursor-pointer text-blue-300 hover:bg-gray-800/50"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Created At
                                    <SortIndicator sortKey="createdAt" />
                                </th>
                                <th className="px-6 py-3 text-center text-blue-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedbacks.map((feedback, index) => (
                                <tr key={feedback._id} className={`border-b border-gray-700 ${
                                    index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                                } hover:bg-gray-700/50`}>
                                    <td className="px-6 py-4 text-gray-300">{feedback.user_email}</td>
                                    <td className="px-6 py-4">
                                        {feedback.image && (
                                            <div 
                                                className="relative cursor-zoom-in"
                                                onMouseEnter={() => setPreviewImage(getImageUrl(feedback.image))}
                                                onMouseLeave={() => setPreviewImage(null)}
                                            >
                                                <img 
                                                    src={getImageUrl(feedback.image)} 
                                                    alt="Feedback" 
                                                    className="w-20 h-20 object-cover rounded transition-transform duration-200 hover:scale-105"
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`
                                                px-4 py-1.5 
                                                rounded-full 
                                                text-xs 
                                                font-medium 
                                                flex items-center gap-1
                                                ${feedback.isReported 
                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                }
                                            `}>
                                                {feedback.isReported ? (
                                                    <>
                                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                        Reported
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        Safe
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{feedback.description}</td>
                                    <td className="px-6 py-4 text-gray-400">{formatDate(feedback.createdAt)}</td>
                                    <td className="px-6 py-4 flex justify-center space-x-2">
                                        {feedback.isReported && (
                                            <button
                                                onClick={() => {
                                                    setSelectedFeedbackId(feedback._id);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1 text-blue-400 hover:text-blue-300"
                                                title="View Report Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteFeedback(feedback._id)}
                                            className="p-1 text-red-400 hover:text-red-300"
                                            title="Delete Feedback"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Report Details Modal */}
            {isModalOpen && selectedFeedbackId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-700"
                    >
                        {(() => {
                            const feedback = feedbacks.find(f => f._id === selectedFeedbackId);
                            return (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-red-500/10 p-2 rounded-lg">
                                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                            </div>
                                            <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                                                Report Details
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                            <div className="flex items-start space-x-3">
                                                <div className="mt-1">
                                                    <AlertOctagon className="w-5 h-5 text-red-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-200 mb-2">
                                                        Reason for Report
                                                    </h3>
                                                    <p className="text-gray-400">
                                                        {feedback?.reportDetails?.reason || 'No reason provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={() => handleClearReport(selectedFeedbackId)}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-colors shadow-lg flex items-center gap-2"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                                Mark as Safe
                                            </button>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminFeedbackView;










