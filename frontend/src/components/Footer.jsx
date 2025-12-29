import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '../assets/sweetLogo.png';

const Footer = () => {
    return (
        <footer className="bg-rose-50 w-full">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <img 
                            src={logo}
                            alt="Sweet Bliss Logo" 
                            className="h-12 w-auto"
                        />
                        <p className="text-gray-600">
                            Creating sweet moments since 2015
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-gray-600 hover:text-pink-600">About Us</Link></li>
                            <li><Link to="/contact" className="text-gray-600 hover:text-pink-600">Contact Us</Link></li>
                            <li><Link to="/ordercake" className="text-gray-600 hover:text-pink-600">Order Cake</Link></li>
                            <li><Link to="/feedback" className="text-gray-600 hover:text-pink-600">Feedback</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li>123 Sweet Street</li>
                            <li>Kuliyapitiya, NY 10001</li>
                            <li>Phone: (555) 123-4567</li>
                            <li>Email: info@sweetbliss.com</li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-pink-600">
                                <Facebook className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-pink-600">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-pink-600">
                                <Twitter className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
                    <p>© 2024 Sweet Bliss. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
