import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, 
    Calendar, 
    User, 
    Lock, 
    CheckCircle, 
    Download,
    Home,
    ShieldCheck,
    Clock,
    CreditCardIcon,
    Receipt,
    AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PaymentPage = () => {
    const navigate = useNavigate();
    const [orderAmount, setOrderAmount] = useState(0);
    const [orderId, setOrderId] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        const pendingOrderId = localStorage.getItem('pendingOrderId');
        const amount = localStorage.getItem('orderAmount');
        
        if (!pendingOrderId || !amount) {
            navigate('/cartview');
            return;
        }
        
        setOrderId(pendingOrderId);
        setOrderAmount(parseFloat(amount));
    }, [navigate]);

    const [paymentMethod, setPaymentMethod] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formattedValue.substring(0, 19));
    };

    const handleExpiryDateChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            const formattedValue = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
            setExpiryDate(formattedValue);
        }
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setCvv(value.substring(0, 3));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Format the card data before sending
            const formattedCardNumber = cardNumber.replace(/\s/g, '');
            const formattedExpiryDate = expiryDate.replace(/\//g, ''); // This will give us MMYY format

            const response = await fetch('http://localhost:8000/payment/verify-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardNumber: formattedCardNumber,
                    cardName: cardName.trim(),
                    expiryDate: formattedExpiryDate,
                    cvv: cvv
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Payment verification failed');
            }

            // Clear payment info from localStorage
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('orderAmount');

            setShowSuccessModal(true);
        } catch (error) {
            toast.error(error.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const response = await fetch(`http://localhost:8000/payment/generate-invoice/${orderId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            // Create a link to download the PDF
            const link = document.createElement('a');
            link.href = `http://localhost:8000${data.invoiceUrl}`;
            link.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error('Failed to download invoice');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 to-white">
            <Header />
            
            <main className="flex-grow container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >

                    {/* Payment Form */}
                    <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden mt-12">
                        <div className="p-6 border-b border-pink-100">
                            <div className="flex items-center space-x-3">
                                <ShieldCheck className="w-6 h-6 text-pink-600" />
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Secure Payment
                                </h1>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {/* Payment Method Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('credit')}
                                        className={`p-6 border rounded-xl flex items-center space-x-4 transition-all ${
                                            paymentMethod === 'credit' 
                                                ? 'border-pink-500 bg-pink-50' 
                                                : 'border-gray-200 hover:border-pink-200'
                                        }`}
                                    >
                                        <CreditCard className="w-6 h-6 text-pink-600" />
                                        <div className="text-left">
                                            <div className="font-medium text-gray-800">Credit Card</div>
                                            <div className="text-sm text-gray-500">Visa, Mastercard</div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('debit')}
                                        className={`p-6 border rounded-xl flex items-center space-x-4 transition-all ${
                                            paymentMethod === 'debit' 
                                                ? 'border-pink-500 bg-pink-50' 
                                                : 'border-gray-200 hover:border-pink-200'
                                        }`}
                                    >
                                        <CreditCard className="w-6 h-6 text-pink-600" />
                                        <div className="text-left">
                                            <div className="font-medium text-gray-800">Debit Card</div>
                                            <div className="text-sm text-gray-500">All major banks</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Card Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            maxLength="19"
                                        />
                                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cardholder Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Expiry Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={expiryDate}
                                                onChange={handleExpiryDateChange}
                                                placeholder="MM/YY"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CVV
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={cvv}
                                                onChange={handleCvvChange}
                                                placeholder="123"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                maxLength="3"
                                            />
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg 
                                        ${isProcessing 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:shadow-pink-500/20'
                                        } transition-all duration-300`}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Lock className="w-5 h-5" />
                                            <span>Pay Rs. {orderAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Security Notice */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-pink-100">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>Your payment information is secure and encrypted</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                    Payment Successful!
                                </h3>
                                <p className="text-gray-600 mb-8">
                                    Your order has been confirmed and will be processed shortly.
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleDownloadInvoice}
                                        className="w-full py-3 px-4 bg-pink-100 text-pink-600 rounded-xl font-medium hover:bg-pink-200 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Receipt className="w-5 h-5" />
                                        <span>Download Invoice</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/home')}
                                        className="w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Home className="w-5 h-5" />
                                        <span>Return to Home</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default PaymentPage;




