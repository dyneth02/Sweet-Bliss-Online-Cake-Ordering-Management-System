import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, Flag, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { useAuth } from '../../context/AuthContext';

const FloatingImageModal = ({ imageSrc, mousePosition }) => {
    if (!imageSrc || !mousePosition) return null;

    return (
        <motion.div 
            className="fixed z-50 pointer-events-none"
            style={{
                left: mousePosition.x + 20, // 20px right shift from cursor
                top: mousePosition.y - 10,  // 10px up shift from cursor
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
        >
            <div className="rounded-lg overflow-hidden shadow-2xl">
                <img 
                    src={imageSrc} 
                    alt="Preview"
                    className="max-w-[300px] max-h-[300px] object-cover bg-white"
                />
            </div>
        </motion.div>
    );
};

const FeedbackPage = () => {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [floatingImage, setFloatingImage] = useState(null);
    const [mousePosition, setMousePosition] = useState(null);

    const [newFeedback, setNewFeedback] = useState({
        userName: '',
        description: '',
        rating: 0,
        image: null,
        user_email: '',
        verifiedPurchase: true
    });

    // Auto-fill user data when modal opens
    useEffect(() => {
        if (isModalOpen && user) {
            setNewFeedback(prev => ({
                ...prev,
                userName: `${user.firstName} ${user.lastName}`,
                user_email: user.email
            }));
        }
    }, [isModalOpen, user]);

    const fetchFeedbacks = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8000/customer/feedbacks', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Remove this filter to show all feedbacks including reported ones
                setFeedbacks(data.data);
            } else {
                setError(data.message || 'Failed to fetch feedbacks');
            }
        } catch (error) {
            setError('Unable to connect to the server. Please check your connection and try again.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid image file (JPEG, PNG, or GIF)');
                return;
            }

            setNewFeedback(prev => ({ ...prev, image: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validate required fields
        if (!newFeedback.userName || !newFeedback.description || !newFeedback.rating || !newFeedback.user_email) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('userName', newFeedback.userName);
            formData.append('description', newFeedback.description);
            formData.append('rating', newFeedback.rating);
            formData.append('user_email', newFeedback.user_email);
            formData.append('verifiedPurchase', newFeedback.verifiedPurchase);
            if (newFeedback.image) {
                formData.append('image', newFeedback.image);
            }

            const response = await fetch('http://localhost:8000/customer/add_feedbacks', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                await fetchFeedbacks();
                setNewFeedback({
                    userName: '',
                    description: '',
                    rating: 0,
                    image: null,
                    user_email: '',
                    verifiedPurchase: true
                });
                setPreviewImage(null);
                setIsModalOpen(false);
            } else {
                throw new Error(data.message || 'Failed to submit feedback');
            }
        } catch (error) {
            setError(error.message || 'Unable to submit feedback. Please try again later.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReport = async (feedbackId, reason) => {
        try {
            const response = await fetch(`http://localhost:8000/customer/update_feedbacks/${feedbackId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'hide',
                    reason: reason,
                    reportedBy: newFeedback.user_email // Add reporter's email
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                await fetchFeedbacks();
            } else {
                setError(data.message || 'Failed to report feedback');
            }
        } catch (error) {
            console.error('Error reporting feedback:', error);
            setError('Failed to report feedback. Please try again.');
        }
    };

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

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 to-white">
            <Header />
            
            <AnimatePresence>
                <FloatingImageModal 
                    imageSrc={floatingImage} 
                    mousePosition={mousePosition}
                />
            </AnimatePresence>

            <main className="flex-grow container mx-auto px-40 py-8">
                {/* Modified Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6">Customer Reviews & Feedback</h1>
                    <div className="relative inline-block">
                        <h2 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 
                            tracking-wide mb-8 relative">
                            Share your Sweet Bliss experience with us!
                            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 
                                bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span>
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 
                            transition-all transform hover:scale-105 shadow-md flex items-center 
                            gap-2 mx-auto mt-8 group"
                        disabled={isLoading}
                    >
                        <MessageSquare className="w-5 h-5 group-hover:animate-bounce" />
                        Share Your Experience
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    </div>
                ) : (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {feedbacks.map((feedback) => (
                            <FeedbackCard 
                                key={feedback._id} 
                                feedback={feedback}
                                onHover={setFloatingImage}
                                onReport={handleReport}
                            />
                        ))}
                    </motion.div>
                )}
            </main>

            <FeedbackModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setPreviewImage(null);
                }}
                feedback={newFeedback}
                setFeedback={setNewFeedback}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
                onImageUpload={handleImageUpload}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />

            <Footer />
        </div>
    );
};

// Update FeedbackCard component to show verified purchase badge and helpful count
const FeedbackCard = ({ feedback, onHover, onReport }) => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `http://localhost:8000${imagePath}`;
    };

    const getContentClasses = () => {
        const baseClasses = "p-6 flex flex-col flex-grow";
        return feedback.isReported 
            ? `${baseClasses} blur-lg`
            : baseClasses;
    };

    const ReportedBanner = () => (
        feedback.isReported && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r text-white text-sm py-2 px-4 text-center backdrop-blur-sm">
                <AlertTriangle className="inline-block w-4 h-4 mr-2" />
                This content has been reported
            </div>
        )
    );

    // Only show floating image for non-reported feedbacks
    const handleImageHover = (imagePath) => {
        if (!feedback.isReported) {
            onHover(imagePath ? getImageUrl(imagePath) : null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                bg-gradient-to-b from-white to-gray-50
                rounded-2xl shadow-lg overflow-hidden
                hover:shadow-2xl transition-all duration-500
                border border-gray-100
                flex flex-col relative
                ${feedback.isReported ? 'opacity-75' : 'opacity-100'}
            `}
            // Remove the onMouseEnter/onMouseLeave from here
        >
            <ReportedBanner />
            
            {feedback.image && (
                <div 
                    className={`
                        relative h-48 overflow-hidden
                        ${feedback.isReported ? 'blur-lg' : 'cursor-zoom-in'}
                    `}
                    onMouseEnter={() => !feedback.isReported && onHover(getImageUrl(feedback.image))}
                    onMouseLeave={() => !feedback.isReported && onHover(null)}
                >
                    <img 
                        src={getImageUrl(feedback.image)}
                        alt={`Feedback by ${feedback.userName}`}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                            e.target.onerror = null;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            )}

            <div className={getContentClasses()}>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 
                            flex items-center justify-center shadow-inner border-2 border-white">
                            <span className="text-pink-600 font-bold text-lg">
                                {feedback.userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-lg">
                                {feedback.userName}
                            </p>
                            <p className="text-sm text-gray-500">
                                {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex bg-gradient-to-r from-pink-50 to-rose-50 rounded-full px-4 py-2 shadow-sm">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 transform ${
                                    i < feedback.rating 
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
                                    : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    {feedback.description}
                </p>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        {feedback.verifiedPurchase && (
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 
                                text-white px-3 py-1.5 rounded-full text-sm shadow-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>Verified Purchase</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full
                            transition-colors duration-300
                            ${feedback.isReported 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-red-50 text-red-500 hover:bg-red-100'}
                        `}
                        disabled={feedback.isReported}
                    >
                        <Flag className="w-4 h-4" />
                        <span className="text-sm">Report</span>
                    </button>
                </div>
            </div>

            {isReportModalOpen && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onSubmit={(reason) => onReport(feedback._id, reason)}
                />
            )}
        </motion.div>
    );
};

const FeedbackModal = ({ 
    isOpen, 
    onClose, 
    feedback, 
    setFeedback, 
    previewImage, 
    setPreviewImage,
    onImageUpload, 
    onSubmit,
    isLoading 
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Add Your Feedback</h2>
                            <button onClick={onClose} disabled={isLoading}>
                                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex gap-6">
                                {/* Left Column - Personal Info and Rating */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            value={feedback.userName}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                            required
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Email
                                        </label>
                                        <input
                                            type="email"
                                            value={feedback.user_email}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                            required
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rating
                                        </label>
                                        <div className="flex gap-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-8 h-8 cursor-pointer ${
                                                        i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                    }`}
                                                    onClick={() => !isLoading && setFeedback(prev => ({ ...prev, rating: i + 1 }))}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Feedback
                                        </label>
                                        <textarea
                                            value={feedback.description}
                                            onChange={(e) => setFeedback(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                            rows="4"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Image Upload */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Image (Optional)
                                        </label>
                                        <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg h-[200px]">
                                            <div className="space-y-1 text-center">
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                                                        <span>Upload a file</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={onImageUpload}
                                                            className="sr-only"
                                                            disabled={isLoading}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, GIF up to 5MB
                                                </p>
                                            </div>
                                        </div>

                                        {/* Image Preview */}
                                        {previewImage && (
                                            <div className="mt-4">
                                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFeedback(prev => ({ ...prev, image: null }));
                                                            setPreviewImage(null);
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading || !feedback.userName || !feedback.description || !feedback.rating || !feedback.user_email}
                                    className={`w-full px-6 py-3 text-white rounded-lg transition-colors ${
                                        isLoading || !feedback.userName || !feedback.description || !feedback.rating || !feedback.user_email
                                            ? 'bg-pink-300 cursor-not-allowed'
                                            : 'bg-pink-600 hover:bg-pink-700'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </div>
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [step, setStep] = useState(1);

    const reportReasons = [
        "Inappropriate content",
        "Fake review",
        "Spam",
        "Harassment",
        "False information",
        "Other"
    ];

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
    };

    const handleSubmit = () => {
        onSubmit(reason);
        onClose();
        // Reset state
        setReason('');
        setStep(1);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <motion.div 
                        className="fixed inset-0 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative z-50"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <h2 className="text-xl font-semibold text-gray-800">Report Feedback</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {step === 1 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <p className="text-gray-600 mb-6">Are you sure you want to report this feedback?</p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        No, Cancel
                                    </button>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Yes, Continue
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select a reason for reporting
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">Select a reason</option>
                                        {reportReasons.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!reason}
                                        className={`px-4 py-2 rounded-lg transition-colors ${
                                            reason 
                                            ? 'bg-red-500 text-white hover:bg-red-600' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackPage;





