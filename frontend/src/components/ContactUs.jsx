import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { toast } from 'react-hot-toast';

const API_URL = "http://localhost:8000";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Message sent successfully! We will get back to you soon.');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <motion.div 
                className="flex-grow mt-20 bg-gradient-to-br from-white to-rose-50 py-12 px-4 sm:px-6 lg:px-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-pink-600 mb-4">Contact Us</h1>
                        <p className="text-lg text-gray-600">We'd love to hear from you! Let us know how we can help.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-semibold text-rose-600 mb-6">Get in Touch</h2>
                                
                                <div className="space-y-6">
                                    <motion.div 
                                        className="flex items-center space-x-4"
                                        variants={itemVariants}
                                    >
                                        <Phone className="w-6 h-6 text-pink-500" />
                                        <div>
                                            <p className="text-gray-600">Phone</p>
                                            <p className="font-medium">+1 (555) 123-4567</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        className="flex items-center space-x-4"
                                        variants={itemVariants}
                                    >
                                        <Mail className="w-6 h-6 text-pink-500" />
                                        <div>
                                            <p className="text-gray-600">Email</p>
                                            <p className="font-medium">info@sweetbliss.com</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        className="flex items-center space-x-4"
                                        variants={itemVariants}
                                    >
                                        <MapPin className="w-6 h-6 text-pink-500" />
                                        <div>
                                            <p className="text-gray-600">Address</p>
                                            <p className="font-medium">123 Sweet Street, Bakery Lane</p>
                                            <p className="font-medium">New York, NY 10001</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        className="flex items-center space-x-4"
                                        variants={itemVariants}
                                    >
                                        <Clock className="w-6 h-6 text-pink-500" />
                                        <div>
                                            <p className="text-gray-600">Hours</p>
                                            <p className="font-medium">Mon-Sat: 9:00 AM - 8:00 PM</p>
                                            <p className="font-medium">Sunday: 10:00 AM - 6:00 PM</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-semibold text-rose-600 mb-6">Send us a Message</h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                                                         bg-rose-50/50 text-gray-800 placeholder-gray-400
                                                         focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                                                         hover:bg-rose-50/70 transition-colors duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                                                         bg-rose-50/50 text-gray-800 placeholder-gray-400
                                                         focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                                                         hover:bg-rose-50/70 transition-colors duration-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md 
                                                     bg-rose-50/50 text-gray-800 placeholder-gray-400
                                                     focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                                                     hover:bg-rose-50/70 transition-colors duration-200"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md 
                                                     bg-rose-50/50 text-gray-800 placeholder-gray-400
                                                     focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                                                     hover:bg-rose-50/70 transition-colors duration-200
                                                     resize-none"
                                            required
                                        ></textarea>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full flex justify-center items-center space-x-2 px-6 py-3 
                                                     bg-pink-600 text-white font-medium rounded-md 
                                                     transition duration-200 shadow-md
                                                     ${isSubmitting 
                                                        ? 'opacity-75 cursor-not-allowed' 
                                                        : 'hover:bg-pink-700 hover:shadow-lg'}`}
                                        >
                                            <Send className="w-5 h-5" />
                                            <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Footer />
        </div>
    );
};

export default ContactUs;

