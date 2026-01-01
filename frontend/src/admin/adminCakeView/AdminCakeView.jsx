import { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "http://localhost:8000/admin";

const AdminCakeView = () => {
    const [cakes, setCakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCake, setSelectedCake] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [popupImageUrl, setPopupImageUrl] = useState('');
    const [modalImagePopup, setModalImagePopup] = useState(false);
    const [modalPopupPosition, setModalPopupPosition] = useState({ x: 0, y: 0 });
    const [modalPopupImage, setModalPopupImage] = useState('');

    // Update the mouse position tracking to only work when needed
    useEffect(() => {
        const handleMouseMove = (event) => {
            if (showImagePopup && !showModal) {
                setMousePosition({
                    x: event.clientX,
                    y: event.clientY
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [showImagePopup, showModal]);

    useEffect(() => {
        fetchCakes();
    }, []);

    const fetchCakes = async () => {
        try {
            const response = await fetch(`${API_URL}/cakes`);
            if (!response.ok) throw new Error('Failed to fetch cakes');
            const data = await response.json();
            if (data.success) {
                setCakes(data.data);
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

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return imagePath.startsWith('http') ? imagePath : `http://localhost:8000${imagePath}`;
    };

    const handleDeleteCake = async (id) => {
        if (!window.confirm('Are you sure you want to delete this cake order?')) return;

        try {
            const response = await fetch(`${API_URL}/cakes/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete cake');
            const data = await response.json();
            if (data.success) {
                setCakes(cakes.filter(cake => cake._id !== id));
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const CakeDetailsModal = ({ cake, onClose }) => {
        const handleImageHover = (e, imageUrl) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setModalPopupPosition({ x: e.clientX, y: e.clientY });
            setModalPopupImage(imageUrl);
            setModalImagePopup(true);
        };

        const handleImageLeave = () => {
            setModalImagePopup(false);
            setModalPopupImage('');
        };

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 p-8 rounded-2xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto border border-gray-700/50 shadow-xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section */}
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-700/50">
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                Cake Order Details
                            </h3>
                            <p className="text-gray-400 mt-1">Order #{cake._id.slice(-6)}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-700/50 rounded-full transition-colors duration-200"
                        >
                            <X size={24} className="text-gray-400 hover:text-white transition-colors" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Customer & Event Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Customer Information</h4>
                                    <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                                        <p className="text-white text-lg">{cake.user_email}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Event Details</h4>
                                    <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                                        <p className="text-white text-lg capitalize">{cake.natureOfEvent}</p>
                                        <p className="text-gray-400 mt-1">
                                            Required by: {formatDate(cake.dateOfRequirement)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Order Specifications</h4>
                                    <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Cake Type</span>
                                            <span className="text-white">{cake.baseTypeOfCake}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Size</span>
                                            <span className="text-white">{cake.cakeSize}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Pickup Option</span>
                                            <span className="text-white">{cake.pickupOption}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Price</span>
                                            <span className="text-lg font-semibold text-green-400">LKR {cake.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Design Details */}
                        <div>
                            <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Design Specifications</h4>
                            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                                {/* Base Colors */}
                                <div className="mb-6">
                                    <p className="text-gray-400 mb-2">Base Colors</p>
                                    <div className="flex gap-3">
                                        {cake.baseColors.map((color, index) => (
                                            <div key={index} className="relative group">
                                                <div
                                                    className="w-8 h-8 rounded-full border-2 border-gray-600 shadow-lg transform transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {color}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Toppings */}
                                <div className="mb-6">
                                    <p className="text-gray-400 mb-2">Toppings</p>
                                    <div className="flex flex-wrap gap-2">
                                        {cake.toppings.map((topping, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-white border border-gray-600 hover:border-purple-500 transition-colors"
                                            >
                                                {topping}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Writings */}
                                {cake.writingsOnTop && (
                                    <div className="mb-6">
                                        <p className="text-gray-400 mb-2">Cake Message</p>
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                            <p className="text-white italic">"{cake.writingsOnTop}"</p>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Notes */}
                                {cake.additionalNotes && (
                                    <div>
                                        <p className="text-gray-400 mb-2">Additional Notes</p>
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                            <p className="text-gray-300">{cake.additionalNotes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reference Image */}
                        {cake.imageUrl && (
                            <div>
                                <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Reference Image</h4>
                                <div 
                                    className="relative group cursor-zoom-in"
                                    onMouseMove={(e) => handleImageHover(e, getImageUrl(cake.imageUrl))}
                                    onMouseLeave={handleImageLeave}
                                >
                                    <img
                                        src={getImageUrl(cake.imageUrl)}
                                        alt="Cake Reference"
                                        className="w-full h-64 object-cover rounded-xl border border-gray-700/50 transition-transform group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Floating Image Popup Overlay */}
                <AnimatePresence>
                    {modalImagePopup && modalPopupImage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                left: `${Math.min(modalPopupPosition.x + 20, window.innerWidth - 420)}px`,
                                top: `${Math.min(modalPopupPosition.y + 20, window.innerHeight - 420)}px`,
                                zIndex: 9999,
                                pointerEvents: 'none',
                            }}
                            className="bg-gray-900/90 p-3 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm"
                        >
                            <img
                                src={modalPopupImage}
                                alt="Enlarged view"
                                className="max-w-[400px] max-h-[400px] rounded-lg object-contain"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const ImagePopup = ({ imageUrl }) => {
        if (!showImagePopup || showModal) return null;

        const x = Math.min(mousePosition.x + 20, window.innerWidth - 320);
        const y = Math.min(mousePosition.y + 20, window.innerHeight - 320);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                    position: 'fixed',
                    left: x,
                    top: y,
                    zIndex: 1000,
                    pointerEvents: 'none',
                    transformOrigin: 'top left'
                }}
                className="bg-gray-900/90 p-2 rounded-lg shadow-2xl border border-gray-700"
            >
                <img
                    src={imageUrl}
                    alt="Enlarged view"
                    className="max-w-[300px] max-h-[300px] rounded-lg"
                    style={{ objectFit: 'contain' }}
                />
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Cake Orders Management</h1>
                <p className="text-gray-400">Manage and track custom cake orders</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
                    {error}
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 backdrop-blur-sm overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-900/50 text-gray-300 text-sm">
                                <th className="py-3 px-6 text-left">Customer</th>
                                <th className="py-3 px-6 text-left">Event Type</th>
                                <th className="py-3 px-6 text-left">Cake Type</th>
                                <th className="py-3 px-6 text-left">Size</th>
                                <th className="py-3 px-6 text-left">Price</th>
                                <th className="py-3 px-6 text-left">Required Date</th>
                                <th className="py-3 px-6 text-left">Pickup Option</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {cakes.map((cake) => (
                                <tr
                                    key={cake._id}
                                    className="border-b border-gray-700/50 hover:bg-gray-700/20"
                                >
                                    <td className="py-4 px-6">{cake.user_email}</td>
                                    <td className="py-4 px-6">{cake.natureOfEvent}</td>
                                    <td className="py-4 px-6">{cake.baseTypeOfCake}</td>
                                    <td className="py-4 px-6">{cake.cakeSize}</td>
                                    <td className="py-4 px-6">LKR {cake.price}</td>
                                    <td className="py-4 px-6">{formatDate(cake.dateOfRequirement)}</td>
                                    <td className="py-4 px-6">{cake.pickupOption}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCake(cake);
                                                    setShowModal(true);
                                                }}
                                                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCake(cake._id)}
                                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {showModal && selectedCake && (
                    <CakeDetailsModal
                        cake={selectedCake}
                        onClose={() => {
                            setShowModal(false);
                            setSelectedCake(null);
                            setShowImagePopup(false);
                            setPopupImageUrl('');
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showImagePopup && popupImageUrl && (
                    <ImagePopup imageUrl={popupImageUrl} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCakeView; 