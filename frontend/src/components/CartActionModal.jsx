import { useState } from 'react';
import { X, AlertTriangle, Minus, Plus, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dispatchCartUpdate } from '../utils/cartUtils';

const CartActionModal = ({ isOpen, onClose, product, onAddToCart, userEmail }) => {
    const [quantity, setQuantity] = useState(1);
    const [showWarning, setShowWarning] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        
        if (newQuantity > product.stockLevel) {
            setShowWarning(true);
            return;
        }
        setShowWarning(false);
        setQuantity(newQuantity);
    };

    const handleSubmit = async () => {
        if (quantity > product.stockLevel) {
            setShowWarning(true);
            return;
        }

        if (!userEmail) {
            setShowWarning(true);
            return;
        }

        setLoading(true);
        try {
            // Update stock level in backend
            const stockUpdateResponse = await fetch('http://localhost:8000/customer/store/update-stock', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemName: product.itemName,
                    quantity: quantity
                }),
            });

            if (!stockUpdateResponse.ok) {
                throw new Error('Failed to update stock');
            }

            // Prepare cart item
            const cartItem = {
                _id: product._id,
                email: userEmail,
                itemName: product.itemName,
                quantity: quantity,
                image: product.image,
                price: product.unitPrice,
                description: product.description
            };

            // Get existing cart items or initialize empty array
            const existingItems = JSON.parse(localStorage.getItem('cartStoreItems') || '[]');

            // Check if item already exists
            const existingItemIndex = existingItems.findIndex(item =>
                item._id === product._id && item.email === userEmail
            );

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                existingItems[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                existingItems.push(cartItem);
            }

            // Save back to localStorage
            localStorage.setItem('cartStoreItems', JSON.stringify(existingItems));

            // Dispatch cart update event
            dispatchCartUpdate();

            // Call the original onAddToCart for any additional handling
            await onAddToCart(product, quantity);

            onClose();
        } catch (error) {
            console.error('Error adding to cart:', error);
            setShowWarning(true);
            setLoading(false);
        }
    };

    // Add warning message for when user is not logged in
    const getWarningMessage = () => {
        if (!userEmail) return "Please log in to add items to cart";
        if (showWarning) return "Quantity exceeds available stock";
        return null;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-2xl overflow-hidden w-full max-w-md mx-4 shadow-[0_8px_32px_rgba(255,192,203,0.3)]"
                >
                    {/* Decorative top bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500" />

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="p-3 bg-pink-100 rounded-xl">
                                    <ShoppingCart className="w-6 h-6 text-pink-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Add to Cart
                                </h2>
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </motion.button>
                        </div>

                        {/* Product details */}
                        <div className="space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Item</span>
                                <span className="font-medium text-gray-800">{product.itemName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Price</span>
                                <span className="font-medium text-pink-600">Rs.{product.unitPrice}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Available</span>
                                <span className="font-medium text-gray-800">{product.stockLevel}</span>
                            </div>
                        </div>

                        {/* Quantity selector */}
                        <div className="flex items-center justify-center gap-6 py-4">
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="p-3 bg-pink-100 rounded-xl hover:bg-pink-200 transition-colors"
                            >
                                <Minus className="w-5 h-5 text-pink-500" />
                            </motion.button>
                            <motion.div 
                                key={quantity}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center"
                            >
                                <span className="text-2xl font-bold text-pink-500">{quantity}</span>
                            </motion.div>
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="p-3 bg-pink-100 rounded-xl hover:bg-pink-200 transition-colors"
                            >
                                <Plus className="w-5 h-5 text-pink-500" />
                            </motion.button>
                        </div>

                        {/* Warning message */}
                        <AnimatePresence>
                            {getWarningMessage() && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100"
                                >
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm font-medium">{getWarningMessage()}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add to cart button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={loading || showWarning || !userEmail}
                            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 
                                ${loading || showWarning || !userEmail
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        <span>Adding to Cart...</span>
                                    </>
                                ) : (
                                    'Add to Cart'
                                )}
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CartActionModal;





