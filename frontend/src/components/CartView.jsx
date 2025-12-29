import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Gift, ShoppingBag, Cake, ArrowRight, Minus, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import { toast } from 'react-toastify';
import { dispatchCartUpdate } from '../utils/cartUtils';

const FloatingImageModal = ({ imageSrc, mousePosition }) => {
    if (!imageSrc || !mousePosition) return null;

    return (
        <motion.div
            className="fixed z-50 pointer-events-none"
            style={{
                left: mousePosition.x + 20,  // 20px right shift from cursor
                top: mousePosition.y - 200,  // Position above cursor
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <div className="rounded-lg overflow-hidden shadow-2xl border border-pink-100 bg-white">
                <img
                    src={imageSrc}
                    alt="Preview"
                    className="w-[300px] h-[300px] object-cover"
                />
            </div>
        </motion.div>
    );
};

const CartView = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cakeItems, setCakeItems] = useState([]);
    const [storeItems, setStoreItems] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [mousePosition, setMousePosition] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [discount, setDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);

    // Check authentication after auth context is loaded
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (!authLoading && user) {
            // Load cart items from localStorage
            const customCakes = JSON.parse(localStorage.getItem('customCakes') || '[]');
            const userCakes = customCakes.filter(cake => cake.user_email === user.email);
            setCakeItems(userCakes);

            // Load store items from localStorage
            const cartStoreItems = JSON.parse(localStorage.getItem('cartStoreItems') || '[]');
            const userStoreItems = cartStoreItems.filter(item => item.email === user.email);
            setStoreItems(userStoreItems);

            // Load applied discount from localStorage
            const appliedDiscount = localStorage.getItem('appliedDiscount');
            if (appliedDiscount) {
                setDiscount(JSON.parse(appliedDiscount));
            }

            setLoading(false);
        }
    }, [user, authLoading, navigate]);

    // Calculate subtotal whenever cart items change
    useEffect(() => {
        const cakeTotal = cakeItems.reduce((sum, item) => sum + item.price, 0);
        const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newSubtotal = cakeTotal + storeTotal;
        setSubtotal(newSubtotal);
    }, [cakeItems, storeItems]);

    // Calculate discount and total whenever subtotal or discount percentage changes
    useEffect(() => {
        if (discount) {
            const discValue = (subtotal * discount) / 100;
            setDiscountAmount(discValue);
            setTotal(subtotal - discValue);
        } else {
            setDiscountAmount(0);
            setTotal(subtotal);
        }
    }, [subtotal, discount]);

    const removeCakeItem = (index) => {
        const updatedCakes = [...cakeItems];
        updatedCakes.splice(index, 1);
        setCakeItems(updatedCakes);
        localStorage.setItem('customCakes', JSON.stringify(updatedCakes));
        dispatchCartUpdate();
    };

    const handlePromoCode = (e) => {
        e.preventDefault();
        
        // Get promo from localStorage
        const savedPromo = localStorage.getItem('promo');
        if (!savedPromo) {
            toast.error('Invalid promo code');
            return;
        }

        const promoData = JSON.parse(savedPromo);
        
        // Check if promo code matches and hasn't been used
        if (promoData.code === promoCode && !promoData.used) {
            setDiscount(promoData.discount);
            // Store the applied discount in localStorage
            localStorage.setItem('appliedDiscount', JSON.stringify(promoData.discount));
            localStorage.removeItem('promo'); // Remove the promo code after use
            toast.success(`${promoData.discount}% discount applied successfully!`);
        } else {
            toast.error('Invalid or expired promo code');
        }
        
        setPromoCode(''); // Clear the input field
    };

    const getImageUrl = (imagePath, itemType) => {
        if (!imagePath) {
            return '/placeholder-cake.jpg';
        }
        // For cake items, use imageUrl directly
        if (itemType === 'cake') {
            return `http://localhost:8000${imagePath}`;
        }
        // For store items, handle both http and relative paths
        return imagePath.startsWith('http') ? imagePath : `http://localhost:8000${imagePath}`;
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const removeStoreItem = (index) => {
        const updatedStoreItems = [...storeItems];
        updatedStoreItems.splice(index, 1);
        setStoreItems(updatedStoreItems);
        localStorage.setItem('cartStoreItems', JSON.stringify(updatedStoreItems));
        dispatchCartUpdate();
    };

    const updateStoreItemQuantity = (index, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedStoreItems = [...storeItems];
        updatedStoreItems[index].quantity = newQuantity;
        setStoreItems(updatedStoreItems);
        localStorage.setItem('cartStoreItems', JSON.stringify(updatedStoreItems));
        dispatchCartUpdate();
    };

    const handleCheckout = async () => {
        if (!user.email) {
            toast.error("Please log in to proceed with checkout");
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        try {
            // Get and format custom cakes
            const customCakes = JSON.parse(localStorage.getItem('customCakes') || '[]')
                .filter(cake => cake.user_email === user.email)
                .map(cake => ({
                    ...cake,
                    price: Number(cake.price),
                    toppings: Array.isArray(cake.toppings) ? cake.toppings : [cake.toppings],
                    baseColors: Array.isArray(cake.baseColors) ? cake.baseColors : [cake.baseColors]
                }));
            
            // Get and format store items
            const storeItems = JSON.parse(localStorage.getItem('cartStoreItems') || '[]')
                .filter(item => item.email === user.email)
                .map(item => ({
                    ...item,
                    price: Number(item.price),
                    quantity: Number(item.quantity)
                }));

            if (customCakes.length === 0 && storeItems.length === 0) {
                toast.error("Your cart is empty");
                return;
            }

            const orderData = {
                user_email: user.email,
                customCakes,
                storeItems
            };

            console.log('Sending order data:', orderData);

            const response = await fetch('http://localhost:8000/customer/create_order_from_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to create order');
            }

            // Clear cart items from localStorage
            const remainingCakes = JSON.parse(localStorage.getItem('customCakes') || '[]')
                .filter(cake => cake.user_email !== user.email);
            localStorage.setItem('customCakes', JSON.stringify(remainingCakes));

            const remainingStoreItems = JSON.parse(localStorage.getItem('cartStoreItems') || '[]')
                .filter(item => item.email !== user.email);
            localStorage.setItem('cartStoreItems', JSON.stringify(remainingStoreItems));

            // Update state and dispatch cart update
            setCakeItems([]);
            setStoreItems([]);
            dispatchCartUpdate();
            
            // Store order info for payment
            localStorage.setItem('pendingOrderId', data.data.orderId);
            localStorage.setItem('orderAmount', data.data.total);

            // Clear the applied discount after successful checkout
            localStorage.removeItem('appliedDiscount');
            setDiscount(null);

            toast.success("Order created successfully!");
            navigate('/payment');
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.message || "Failed to create order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const removeAllCartItems = () => {
        // Clear cart items
        setCakeItems([]);
        setStoreItems([]);
        
        // Clear the applied discount as well
        setDiscount(null);
        localStorage.removeItem('appliedDiscount');
        
        // Update localStorage
        const remainingCakes = JSON.parse(localStorage.getItem('customCakes') || '[]')
            .filter(cake => cake.user_email !== user.email);
        localStorage.setItem('customCakes', JSON.stringify(remainingCakes));

        const remainingStoreItems = JSON.parse(localStorage.getItem('cartStoreItems') || '[]')
            .filter(item => item.email !== user.email);
        localStorage.setItem('cartStoreItems', JSON.stringify(remainingStoreItems));

        dispatchCartUpdate();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white">
            <Header />

            <AnimatePresence>
                {previewImage && mousePosition && (
                    <FloatingImageModal
                        imageSrc={previewImage}
                        mousePosition={mousePosition}
                    />
                )}
            </AnimatePresence>

            {(loading || authLoading) ? (
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-4 border-pink-400 rounded-full animate-spin"></div>
                    </div>
                </div>
            ) : (
                <motion.main
                    className="container mx-auto px-4 py-24 max-w-7xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.h1
                        className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500 mb-8 text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Your Shopping Cart
                    </motion.h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items Section */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Custom Cakes Section */}
                            {cakeItems.length > 0 && (
                                <motion.section
                                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-pink-100/50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="flex items-center mb-6">
                                        <div className="p-3 bg-pink-100 rounded-2xl mr-4">
                                            <Cake className="text-pink-600" size={24} />
                                        </div>
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 text-transparent bg-clip-text">
                                            Custom Cakes
                                        </h2>
                                    </div>
                                    <AnimatePresence>
                                        {cakeItems.map((cake, index) => (
                                            <motion.div
                                                key={index}
                                                className="group relative flex items-center gap-6 p-6 mb-4 rounded-2xl bg-white border border-pink-100 hover:border-pink-200 transition-all duration-300 hover:shadow-lg"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                {/* Image Section */}
                                                <div 
                                                    className="flex-shrink-0 w-32 h-32 relative"
                                                    onMouseEnter={() => setPreviewImage(getImageUrl(cake.imageUrl, 'cake'))}
                                                    onMouseLeave={() => setPreviewImage(null)}
                                                >
                                                    <img
                                                        src={getImageUrl(cake.imageUrl, 'cake')}
                                                        alt={cake.natureOfEvent}
                                                        className="w-full h-full object-cover rounded-xl shadow-md border border-pink-100"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-cake.jpg';
                                                        }}
                                                    />
                                                </div>

                                                {/* Details Section */}
                                                <div className="flex-grow">
                                                    <h3 className="font-semibold text-lg text-gray-800">{cake.natureOfEvent} Cake</h3>
                                                    <div className="space-y-2 mt-2">
                                                        <p className="text-sm text-gray-600">
                                                            Size: <span className="font-medium text-gray-800">{cake.cakeSize}</span>
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Delivery: <span className="font-medium text-gray-800">{cake.pickupOption}</span>
                                                        </p>
                                                        {cake.description && (
                                                            <p className="text-sm text-gray-600 mt-2">{cake.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price and Actions Section */}
                                                <div className="flex flex-col items-end gap-4">
                                                    <span className="font-bold text-lg text-pink-600">Rs. {cake.price}</span>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeCakeItem(index)}
                                                        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 size={20} />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.section>
                            )}

                            {/* Store Items Section */}
                            <motion.section
                                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-pink-100/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-pink-100 rounded-2xl mr-4">
                                        <ShoppingBag className="text-pink-600" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 text-transparent bg-clip-text">
                                        Store Items
                                    </h2>
                                </div>
                                {storeItems.length === 0 ? (
                                    <div className="text-center py-12 px-6 rounded-2xl bg-pink-50/50">
                                        <p className="text-gray-500 font-medium">No store items in cart</p>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => navigate('/store')}
                                            className="mt-4 text-pink-600 font-semibold flex items-center gap-2 mx-auto"
                                        >
                                            Browse Store <ArrowRight size={16} />
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {storeItems.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    className="group relative flex items-center gap-6 p-6 mb-4 rounded-2xl bg-white border border-pink-100 hover:border-pink-200 transition-all duration-300 hover:shadow-lg"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    whileHover={{ scale: 1.01 }}
                                                >
                                                    {/* Image Section */}
                                                    <div 
                                                        className="flex-shrink-0 w-32 h-32 relative"
                                                        onMouseEnter={() => setPreviewImage(getImageUrl(item.image, 'store'))}
                                                        onMouseLeave={() => setPreviewImage(null)}
                                                    >
                                                        <img
                                                            src={getImageUrl(item.image, 'store')}
                                                            alt={item.itemName}
                                                            className="w-full h-full object-cover rounded-xl shadow-md border border-pink-100"
                                                            onError={(e) => {
                                                                e.target.src = '/placeholder-item.jpg';
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Details Section */}
                                                    <div className="flex-grow">
                                                        <h3 className="font-semibold text-lg text-gray-800">{item.itemName}</h3>
                                                        <p className="text-sm text-gray-600 mt-2">{item.description}</p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-4 mt-4">
                                                            <button
                                                                onClick={() => updateStoreItemQuantity(index, item.quantity - 1)}
                                                                className="p-1 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span className="font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateStoreItemQuantity(index, item.quantity + 1)}
                                                                className="p-1 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price and Actions Section */}
                                                    <div className="flex flex-col items-end gap-4">
                                                        <span className="font-bold text-lg text-pink-600">
                                                            Rs. {item.price * item.quantity}
                                                        </span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => removeStoreItem(index)}
                                                            className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 size={20} />
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.section>
                        </div>

                        {/* Order Summary Section */}
                        <motion.div
                            className="lg:col-span-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-pink-100/50 sticky top-24">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 text-transparent bg-clip-text mb-8">
                                    Order Summary
                                </h2>

                                {/* Promo Code Section */}
                                <motion.form
                                    onSubmit={handlePromoCode}
                                    className="mb-8"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow">
                                            <Gift className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Enter promo code"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50"
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-2xl font-medium shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-shadow"
                                        >
                                            Apply
                                        </motion.button>
                                    </div>
                                </motion.form>

                                {/* Price Summary */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center py-3 border-b border-pink-100">
                                        <span className="text-gray-600 font-medium">Subtotal</span>
                                        <span className="font-semibold text-gray-800">Rs. {subtotal.toFixed(2)}</span>
                                    </div>
                                    {discount && (
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-green-600 font-medium">Discount ({discount}%)</span>
                                            <span className="font-semibold text-green-800">-Rs. {discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-xl font-bold text-gray-800">Total</span>
                                        <span className="text-xl font-bold text-pink-600">Rs. {total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-2xl font-semibold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-shadow flex items-center justify-center gap-2"
                                    onClick={handleCheckout}
                                    disabled={isProcessing || (cakeItems.length === 0 && storeItems.length === 0)}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="animate-spin">⌛</span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Proceed to Checkout
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </motion.main>
            )}

            <Footer />
        </div>
    );
};

export default CartView;














