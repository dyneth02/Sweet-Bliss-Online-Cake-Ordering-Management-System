import React from 'react';
import { motion } from 'framer-motion';
import { Building2, CreditCard, Info } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const AboutUs = () => {
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

    const bankAccounts = [
        {
            bank: "Commercial Bank",
            accountName: "Sweet Bliss Cakes Ltd",
            accountNumber: "1234-5678-9012-3456",
            branch: "Main Street Branch"
        },
        {
            bank: "Bank of Ceylon",
            accountName: "Sweet Bliss Cakes Ltd",
            accountNumber: "9876-5432-1098-7654",
            branch: "Central Branch"
        },
        {
            bank: "People's Bank",
            accountName: "Sweet Bliss Cakes Ltd",
            accountNumber: "4567-8901-2345-6789",
            branch: "City Center Branch"
        }
    ];

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
                        <h1 className="text-4xl font-bold text-pink-600 mb-4">About Us</h1>
                        <p className="text-lg text-gray-600">Creating Sweet Moments Since 2015</p>
                    </div>

                    {/* About Us Description */}
                    <motion.div 
                        className="bg-white rounded-xl shadow-lg p-8 mb-12"
                        variants={itemVariants}
                    >
                        <div className="flex items-center mb-6">
                            <Info className="w-8 h-8 text-pink-500 mr-4" />
                            <h2 className="text-2xl font-semibold text-rose-600">Our Story</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Sweet Bliss began its journey with a simple passion for creating delightful moments through 
                            exquisite cakes and pastries. Founded in 2015, we've grown from a small home bakery to 
                            one of the most trusted names in custom cake creation. Our team of skilled artisans combines 
                            traditional baking methods with modern techniques to create stunning masterpieces that not 
                            only look beautiful but taste amazing.
                        </p>
                        <p className="text-gray-600 leading-relaxed mt-4">
                            We pride ourselves on using only the finest ingredients and creating each cake with 
                            meticulous attention to detail. Whether it's a wedding, birthday, or special celebration, 
                            we're dedicated to making your moments sweeter and more memorable.
                        </p>
                    </motion.div>

                    {/* Bank Account Details */}
                    <div>
                        <div className="flex items-center mb-8">
                            <Building2 className="w-8 h-8 text-pink-500 mr-4" />
                            <h2 className="text-2xl font-semibold text-rose-600">Banking Information</h2>
                        </div>
                    
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {bankAccounts.map((account, index) => (
                                <motion.div 
                                    key={index}
                                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center mb-4">
                                        <CreditCard className="w-6 h-6 text-pink-500 mr-3" />
                                        <h3 className="text-xl font-semibold text-gray-800">{account.bank}</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Account Name:</span>
                                            <br />
                                            {account.accountName}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Account Number:</span>
                                            <br />
                                            {account.accountNumber}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Branch:</span>
                                            <br />
                                            {account.branch}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            <Footer />
        </div>
    );
};

export default AboutUs;

