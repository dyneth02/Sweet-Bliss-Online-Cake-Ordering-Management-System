import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import logo from '../assets/sweetLogo.png';

const Header = () => {
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        // Function to update cart count
        const updateCartCount = () => {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
                setCartItemCount(totalItems);
            } else {
                setCartItemCount(0);
            }
        };

        // Initial cart count
        updateCartCount();

        // Listen for storage changes
        window.addEventListener('storage', updateCartCount);
        
        // Custom event listener for cart updates
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    return (
        <header className="w-full bg-white shadow-md fixed top-0 z-50">
            <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
                {/* Logo Section */}
                <Link to="/home" className="flex items-center">
                    <img 
                        src={logo}
                        alt="Sweet Bliss Logo" 
                        className="h-12 w-auto"
                    />
                </Link>

                {/* Navigation */}
                <nav className="flex items-center space-x-8">
                    <Link to="/" className="text-gray-700 hover:text-pink-600 transition-colors">
                        Home
                    </Link>
                    <Link to="/store" className="text-gray-700 hover:text-pink-600 transition-colors">
                        Store
                    </Link>
                    <Link to="/feedback" className="text-gray-700 hover:text-pink-600 transition-colors">
                        Feedback
                    </Link>
                    <Link to="/about" className="text-gray-700 hover:text-pink-600 transition-colors">
                        About Us
                    </Link>
                    <Link to="/contact" className="text-gray-700 hover:text-pink-600 transition-colors">
                        Contact Us
                    </Link>
                    <Link to="/cartview" className="text-gray-700 hover:text-pink-600 transition-colors relative">
                        <ShoppingCart className="w-6 h-6" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-pink-600 transition-colors">
                        <User className="w-6 h-6" />
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;

