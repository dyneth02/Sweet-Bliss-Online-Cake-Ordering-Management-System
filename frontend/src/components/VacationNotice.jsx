import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const VacationNotice = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            
            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="mb-6">
                        <Plane className="w-16 h-16 text-pink-500 mx-auto" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        We're Currently Away
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        Our cake artist is currently unavailable. We apologize for any inconvenience. 
                        Please feel free to contact us for future orders or any inquiries.
                    </p>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/contact')}
                        className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg 
                                 hover:bg-pink-600 transition-colors duration-200"
                    >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Contact Us
                    </motion.button>
                </motion.div>
            </main>
            
            <Footer />
        </div>
    );
};

export default VacationNotice;