import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ShoppingCart, Heart, Search, AlertTriangle, Package, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartActionModal from '../../components/CartActionModal';
import { toast } from 'react-toastify';

const StoreView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const { user } = useContext(AuthContext);

    const LOW_STOCK_THRESHOLD = 10;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8000/customer/store');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (item) => {
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        try {
            // Get existing cart items from localStorage
            const cartItems = JSON.parse(localStorage.getItem('cartStoreItems') || '[]');
            
            // Check if item already exists in cart
            const existingItemIndex = cartItems.findIndex(
                cartItem => cartItem._id === item._id && cartItem.email === user.email
            );

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                cartItems[existingItemIndex].quantity += 1;
            } else {
                // Add new item if it doesn't exist
                cartItems.push({
                    _id: item._id,
                    itemName: item.itemName,
                    price: item.unitPrice,
                    quantity: 1,
                    image: item.image,
                    description: item.description,
                    email: user.email
                });
            }

            // Save updated cart back to localStorage
            localStorage.setItem('cartStoreItems', JSON.stringify(cartItems));
            toast.success('Item added to cart!');
        } catch (error) {
            console.error('Error adding item to cart:', error);
            toast.error('Failed to add item to cart');
        }
    };

    const openCartModal = (product) => {
        if (!user || !user.email) {
            toast.error('Please log in to add items to cart');
            navigate('/login');
            return;
        }
        setSelectedProduct(product);
        setIsCartModalOpen(true);
    };

    const filteredProducts = products.filter(product => 
        product.itemName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === 'All' || product.category === selectedCategory)
    );

    const renderStockStatus = (stockLevel) => {
        if (stockLevel === 0) {
            return (
                <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-medium">Out of Stock</span>
                </div>
            );
        } else if (stockLevel < LOW_STOCK_THRESHOLD) {
            return (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Only {stockLevel} left</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <Package className="w-4 h-4" />
                <span className="text-xs font-medium">In Stock</span>
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500">
            {error}
        </div>
    );

    const renderProductCard = (product) => {
        const isOutOfStock = product.stockLevel === 0;
        
        return (
            <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 
                    ${isOutOfStock ? 'opacity-75' : ''}`}
            >
                {/* Product Image Container */}
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={product.image.includes('https') ? product.image : `http://localhost:8000${product.image}`}
                        alt={product.itemName}
                        className={`w-full h-full object-cover transform transition-transform duration-500 
                            ${isOutOfStock ? 'grayscale' : 'group-hover:scale-110'}`}
                    />
                    
                    {/* Overlay with quick actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex gap-3">
                            {!isOutOfStock && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openCartModal(product);
                                    }}
                                    className="p-3 bg-white rounded-full transform hover:scale-110 transition-transform duration-200"
                                >
                                    <ShoppingCart className="w-5 h-5 text-pink-500" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stock Status Badges */}
                    {isOutOfStock ? (
                        <div className="absolute top-3 left-3 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Out of Stock
                        </div>
                    ) : (
                        product.stockLevel < LOW_STOCK_THRESHOLD && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                                Only {product.stockLevel} left!
                            </div>
                        )
                    )}
                </div>

                {/* Product Details */}
                <div className="p-5">
                    {/* Category Tag */}
                    <div className="mb-2">
                        <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-1 rounded-full">
                            {product.category || 'Sweet Treats'}
                        </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                        {product.itemName}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className="w-4 h-4 text-yellow-400 fill-current" 
                            />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">(4.5)</span>
                    </div>

                    {/* Price and Stock Status */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Price</span>
                            <span className={`text-xl font-bold ${isOutOfStock ? 'text-gray-400' : 'text-pink-600'}`}>
                                Rs. {product.unitPrice}
                            </span>
                        </div>
                        {renderStockStatus(product.stockLevel)}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <main className="flex-grow bg-gradient-to-b from-white to-pink-50">
                {/* Store Content */}
                <div className="mt-20"> {/* Added margin-top to account for fixed header */}
                    {/* Search Section */}
                    <div className="bg-white py-6 px-40 sticky top-20 z-10">
                        <div className="container mx-auto px-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold text-pink-600">Sweet Bliss Store</h1>
                                
                                {/* Search Bar */}
                                <div className="relative max-w-md w-full mx-4">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 rounded-full border border-pink-200 focus:outline-none focus:border-pink-500"
                                    />
                                    <Search className="absolute right-3 top-2.5 text-pink-400 w-5 h-5" />
                                </div>

                                {/* Cart Icon */}
                                <button className="relative p-2 hover:bg-pink-50 rounded-full transition-colors">
                                    <ShoppingCart className="w-6 h-6 text-pink-600" />
                                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        0
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(renderProductCard)}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Cart Action Modal */}
            <CartActionModal
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                userEmail={user?.email}
            />
        </div>
    );
};

export default StoreView;
