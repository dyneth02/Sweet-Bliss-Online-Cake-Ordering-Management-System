import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, Upload, ShoppingCart, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaintBucket } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { dispatchCartUpdate } from '../utils/cartUtils';

const CakeOrderForm = () => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const currentDate = new Date();
    const minSelectableDate = new Date(currentDate);
    minSelectableDate.setDate(currentDate.getDate() + 2);

    // Get user email from context instead of localStorage
    const userEmail = user?.email;

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const [formData, setFormData] = useState({
        eventNature: '',
        baseType: 'Butter Cake',
        dateOfRequirement: '',
        cakeWeight: '500g',
        baseColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
        pickupOption: 'Self Pickup',
        toppings: 'Sprinkles',
        writingsOnTop: '',
        designOption: '',
        designFile: null,
        designFileBase64: '',
        additionalNotes: ''
    });

    const [colorPickerOpen, setColorPickerOpen] = useState(null);
    const [price, setPrice] = useState(0);

    const [isVacationMode, setIsVacationMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [generatedImages, setGeneratedImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedDesignUrl, setSelectedDesignUrl] = useState(null);

    // Price mapping
    const prices = {
        baseType: {
            'Butter Cake': 500,
            'Chocolate Cake': 550,
            'Ribbon Cake': 600,
            'Candy Cane Cake': 650
        },
        cakeWeight: {
            '500g': 600,
            '1kg': 650,
            '2kg': 700
        },
        pickupOption: {
            'Self Pickup': 0,
            'Delivery': 500
        },
        toppings: {
            'Sprinkles': 150,
            'Cherries on top': 200,
            'Choco Powder': 220
        }
    };

    // Add color palette definition at the top of the component
    const colorPalette = [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Pink', hex: '#FF69B4' },
        { name: 'Red', hex: '#FF0000' },
        { name: 'Orange', hex: '#FFA500' },
        { name: 'Yellow', hex: '#FFD700' },
        { name: 'Green', hex: '#32CD32' },
        { name: 'Turquoise', hex: '#40E0D0' },
        { name: 'Blue', hex: '#1E90FF' },
        { name: 'Purple', hex: '#8A2BE2' },
        { name: 'Brown', hex: '#8B4513' },
        { name: 'Black', hex: '#000000' },
        { name: 'Silver', hex: '#C0C0C0' }
    ];

    // Calculate total price whenever form data changes
    useEffect(() => {
        const basePrice = prices.baseType[formData.baseType] || 0;
        const weightPrice = prices.cakeWeight[formData.cakeWeight] || 0;
        const pickupPrice = prices.pickupOption[formData.pickupOption] || 0;
        const toppingPrice = prices.toppings[formData.toppings] || 0;

        const total = basePrice + weightPrice + pickupPrice + toppingPrice;
        setPrice(total);
    }, [formData]);

    useEffect(() => {
        const checkVacationMode = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/vacation-mode/status');
                const data = await response.json();
                setIsVacationMode(data.isEnabled);
            } catch (error) {
                console.error('Error checking vacation mode:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkVacationMode();
    }, []);

    const daysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const firstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const showAlert = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    const handleDateClick = (day) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        if (clickedDate < currentDate) {
            showAlert('You cannot select a date in the past.');
            return;
        }

        const twoDaysFromNow = new Date(currentDate);
        twoDaysFromNow.setDate(currentDate.getDate() + 2);

        if (clickedDate <= twoDaysFromNow) {
            showAlert('You need to select a date at least 3 days from today.');
            return;
        }

        setSelectedDate(clickedDate);
        setFormData({
            ...formData,
            dateOfRequirement: clickedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        });
    };

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleColorChange = (index, color) => {
        const newColors = [...formData.baseColors];
        newColors[index] = color;
        setFormData({
            ...formData,
            baseColors: newColors
        });
        setColorPickerOpen(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showAlert('File size must not exceed 10MB.');
                return;
            }

            const validExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (!validExtensions.includes(fileExtension)) {
                showAlert('Only PNG, JPG, JPEG, and SVG files are allowed.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    designFile: file,
                    designFileBase64: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check authentication first
        if (!user || !userEmail) {
            showAlert("Please log in to place an order");
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showAlert("Your session has expired. Please log in again.");
            navigate('/login');
            return;
        }

        const emptyFields = [];

        if (!formData.eventNature.trim()) {
            emptyFields.push('Nature of the Event');
        }

        if (!formData.dateOfRequirement) {
            emptyFields.push('Date of Requirement');
        }

        if (!formData.designOption) {
            emptyFields.push('Design Option');
        } else if (formData.designOption === 'I have one already' && !formData.designFile) {
            emptyFields.push('Design File');
        }

        if (emptyFields.length > 0) {
            showAlert(`The following fields are empty: ${emptyFields.join(', ')}. Please fill them all to continue.`);
            return;
        }

        if (formData.eventNature.length > 100) {
            showAlert('Event nature must not exceed 100 characters.');
            return;
        }

        if (formData.writingsOnTop.length > 100) {
            showAlert('Writings on top must not exceed 100 characters.');
            return;
        }

        if (formData.additionalNotes.split(/\s+/).length > 100) {
            showAlert('Additional notes must not exceed 100 words.');
            return;
        }

        const formDataToSend = new FormData();

        // Use email from context
        formDataToSend.append('user_email', userEmail);
        
        // Ensure baseColors is an array and properly stringified
        const baseColorsArray = Array.isArray(formData.baseColors) ? formData.baseColors : [formData.baseColors];
        
        // For toppings, since it's a single selection in your form, wrap it in an array
        const toppingsArray = [formData.toppings];

        // Debug logging
        console.log('baseColorsArray before stringify:', baseColorsArray);
        console.log('toppingsArray before stringify:', toppingsArray);
        console.log('stringified baseColors:', JSON.stringify(baseColorsArray));
        console.log('stringified toppings:', JSON.stringify(toppingsArray));

        // Append form data with properly stringified arrays
        formDataToSend.append('natureOfEvent', formData.eventNature);
        formDataToSend.append('baseTypeOfCake', formData.baseType);
        formDataToSend.append('dateOfRequirement', formData.dateOfRequirement);
        formDataToSend.append('cakeSize', formData.cakeWeight);
        formDataToSend.append('baseColors', JSON.stringify(baseColorsArray));
        formDataToSend.append('toppings', JSON.stringify(toppingsArray));
        formDataToSend.append('pickupOption', formData.pickupOption);
        formDataToSend.append('writingsOnTop', formData.writingsOnTop);
        formDataToSend.append('additionalNotes', formData.additionalNotes);
        formDataToSend.append('price', price);

        if (formData.designFile) {
            formDataToSend.append('image', formData.designFile);
        }

        // Debug: Log the final FormData contents
        for (let pair of formDataToSend.entries()) {
            console.log('FormData entry:', pair[0], pair[1]);
        }
        console.log(formDataToSend);

        try {
            // Fix the URL typo (changed from 'cutomer' to 'customer')
            const response = await fetch('http://localhost:8000/customer/create_cake', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            // First check if the response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned non-JSON response");
            }

            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    showAlert("Your session has expired. Please log in again.");
                    navigate('/login');
                    return;
                }
                throw new Error(data.message || 'Failed to create cake order');
            }

            // Store cake data in localStorage
            const cartCakeData = {
                user_email: userEmail,  // Adding user email here
                natureOfEvent: formData.eventNature,
                baseTypeOfCake: formData.baseType,
                dateOfRequirement: formData.dateOfRequirement,
                cakeSize: formData.cakeWeight,
                baseColors: baseColorsArray,
                pickupOption: formData.pickupOption,
                toppings: toppingsArray,
                writingsOnTop: formData.writingsOnTop,
                imageUrl: data.data.imageUrl || '',
                additionalNotes: formData.additionalNotes,
                price: price,
                quantity: 1,
                type: 'cake'
            };

            // Get existing cakes from localStorage or initialize empty array
            const existingCakes = JSON.parse(localStorage.getItem('customCakes') || '[]');
            
            // Add new cake to array
            existingCakes.push(cartCakeData);
            
            // Save updated array back to localStorage
            localStorage.setItem('customCakes', JSON.stringify(existingCakes));
            
            // Dispatch cart update event
            dispatchCartUpdate();
            
            // Add to cart context (keeping this for backward compatibility)
            await addToCart(cartCakeData, 'cake');
            showAlert("Your cake has been added to cart!");
            
            // Reset form
            setFormData({
                eventNature: '',
                baseType: 'Butter Cake',
                dateOfRequirement: '',
                cakeWeight: '500g',
                baseColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
                pickupOption: 'Self Pickup',
                toppings: 'Sprinkles',
                writingsOnTop: '',
                designOption: '',
                designFile: null,
                designFileBase64: '',
                additionalNotes: ''
            });
            setSelectedDate(null);
        } catch (error) {
            console.error('Error creating cake order:', error);
            showAlert(error.message || "An error occurred while creating your cake order");
        }
    };

    const handleGenerateDesigns = async () => {
        if (!formData.eventNature || !formData.baseType || !formData.toppings) {
            showAlert('Please fill in the event nature, base type, and toppings before generating designs.');
            return;
        }

        setIsGenerating(true);
        try {
            const requestData = {
                eventNature: formData.eventNature.trim(),
                baseType: formData.baseType.trim(),
                toppings: formData.toppings.trim(),
                writingsOnTop: formData.writingsOnTop ? formData.writingsOnTop.trim() : ''
            };

            console.log('Sending request with data:', requestData);

            const response = await fetch('http://localhost:8000/api/ai-design/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            console.log('Received response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to generate designs');
            }

            if (data.success && data.images && data.images.length > 0) {
                setGeneratedImages(data.images);
                setSelectedDesignUrl(null);
            } else {
                throw new Error('No designs were generated');
            }
        } catch (error) {
            console.error('Error generating designs:', error);
            showAlert(error.message || 'Failed to generate designs. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDesignSelect = (imageUrl) => {
        setSelectedDesignUrl(imageUrl);
        // Convert image URL to file object
        fetch(imageUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'ai-generated-design.png', { type: 'image/png' });
                setFormData({
                    ...formData,
                    designFile: file,
                    designFileBase64: imageUrl
                });
            })
            .catch(error => {
                console.error('Error converting image URL to file:', error);
            });
    };

    const renderCalendar = () => {
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();
        const daysCount = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);

        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }

        for (let day = 1; day <= daysCount; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === currentDate.toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isPast = date < currentDate;
            const isTooSoon = date <= new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + 2
            );
            const isDisabled = isPast || isTooSoon;

            days.push(
                <motion.div
                    key={`day-${day}`}
                    whileHover={!isDisabled ? { scale: 1.1 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => !isDisabled && handleDateClick(day)}
                    className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer transition-colors 
                        ${isToday ? 'bg-blue-200 text-gray-300' : ''}
                        ${isSelected ? 'bg-pink-600 text-white' : ''}
                        ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-pink-200'}
                        ${!isDisabled ? 'text-gray-800' : 'hover:bg-pink-200'}
                    `}
                >
                    {day}
                </motion.div>
            );
        }

        return days;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (isVacationMode) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow flex items-center justify-center bg-gray-50 p-8">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div className="mt-20 backdrop-blur-lg bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
                                Sweet Bliss is Taking a Break
                            </h2>
                            <p className="text-gray-600 mb-6">
                                We're currently unavailable for custom cake orders. We apologize for any inconvenience and look forward to creating your dream cake soon!
                            </p>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <motion.div
                className="flex-grow mt-20 w-full mx-auto bg-white"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center p-8 space-y-8 w-full max-w-7xl mx-auto">
                    <motion.div
                        className="mb-8 text-center w-full"
                        variants={itemVariants}
                    >
                        <h1 className="text-5xl font-bold text-pink-600 mb-5">Custom Cake Order</h1>
                        <p className="text-2xl font-bold text-rose-700">Unveil your Desires</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                        <motion.div
                            className="lg:col-span-1 bg-pink-50 p-6 rounded-lg"
                            variants={itemVariants}
                        >
                            <div className="mb-4">
                                <div className="flex items-center justify-center mb-2">
                                    <Calendar className="text-pink-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Select Delivery Date
                                    </h2>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="button"
                                        onClick={handlePrevMonth}
                                        className="p-2 rounded-full bg-pink-200 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        <ChevronLeft className="text-pink-600" />
                                    </motion.button>
                                    <h3 className="text-lg font-medium text-gray-700">
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="p-2 rounded-full bg-pink-200 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        <ChevronRight className="text-pink-600" />
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    <div className="text-sm font-medium text-gray-500">Su</div>
                                    <div className="text-sm font-medium text-gray-500">Mo</div>
                                    <div className="text-sm font-medium text-gray-500">Tu</div>
                                    <div className="text-sm font-medium text-gray-500">We</div>
                                    <div className="text-sm font-medium text-gray-500">Th</div>
                                    <div className="text-sm font-medium text-gray-500">Fr</div>
                                    <div className="text-sm font-medium text-gray-500">Sa</div>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {renderCalendar()}
                                </div>

                                <div className="mt-4 text-sm text-gray-500 flex items-center">
                                    <AlertCircle className="text-pink-600 mr-2 h-4 w-4" />
                                    <span>* Orders require at least 2 days advance notice</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md"
                            variants={itemVariants}
                        >
                            <div className="space-y-6">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nature of the Event
                                    </label>
                                    <input
                                        type="text"
                                        name="eventNature"
                                        value={formData.eventNature}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border bg-white font-medium text-orange-950 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Base Type
                                    </label>
                                    <select
                                        name="baseType"
                                        value={formData.baseType}
                                        onChange={handleInputChange}
                                        className="w-full bg-white text-orange-950 font-medium p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        <option value="Butter Cake">Butter Cake</option>
                                        <option value="Chocolate Cake">Chocolate Cake</option>
                                        <option value="Ribbon Cake">Ribbon Cake</option>
                                        <option value="Ribbon Cake">Candy Cane Cake</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Requirement
                                    </label>
                                    <input
                                        type="text"
                                        name="dateOfRequirement"
                                        value={formData.dateOfRequirement}
                                        readOnly
                                        className="w-full p-2 bg-white font-medium text-orange-950  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cake Weight
                                    </label>
                                    <select
                                        name="cakeWeight"
                                        value={formData.cakeWeight}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border bg-white text-orange-950 font-medium border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        <option value="500g">500g</option>
                                        <option value="1kg">1kg</option>
                                        <option value="2kg">2kg</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pickup Option
                                    </label>
                                    <select
                                        name="pickupOption"
                                        value={formData.pickupOption}
                                        onChange={handleInputChange}
                                        className="w-full bg-white text-orange-950 font-medium p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        <option value="Self Pickup">Self Pickup</option>
                                        <option value="Delivery">Delivery</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Base Colors
                                    </label>
                                    <div className="flex space-x-4">
                                        {[0, 1, 2].map((index) => (
                                            <div key={`color-${index}`} className="relative">
                                                <motion.button
                                                    type="button"
                                                    onClick={() => setColorPickerOpen(index === colorPickerOpen ? null : index)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500 flex items-center justify-center"
                                                    style={{ backgroundColor: formData.baseColors[index] }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <PaintBucket className="w-4 h-4 text-white" />
                                                </motion.button>

                                                <AnimatePresence>
                                                    {colorPickerOpen === index && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute z-10 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200 grid grid-cols-4 gap-1"
                                                            style={{ width: '160px', left: '-65px' }}
                                                        >
                                                            {colorPalette.map((color) => (
                                                                <motion.button
                                                                    key={color.hex}
                                                                    type="button"
                                                                    onClick={() => handleColorChange(index, color.hex)}
                                                                    className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden focus:outline-none hover:scale-110 transition-transform relative group"
                                                                    style={{ backgroundColor: color.hex }}
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    {formData.baseColors[index] === color.hex && (
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <div className="w-4 h-4 rounded-full bg-white/30" />
                                                                        </div>
                                                                    )}
                                                                    <span className="sr-only">{color.name}</span>
                                                                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                        {color.name}
                                                                    </div>
                                                                </motion.button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md"
                            variants={itemVariants}
                        >
                            <div className="space-y-6">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Toppings
                                    </label>
                                    <select
                                        name="toppings"
                                        value={formData.toppings}
                                        onChange={handleInputChange}
                                        className="w-full bg-white text-orange-950 font-medium p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        <option value="Sprinkles">Sprinkles</option>
                                        <option value="Cherries on top">Cherries on top</option>
                                        <option value="Choco Powder">Choco Powder</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Writings on Top
                                    </label>
                                    <input
                                        type="text"
                                        name="writingsOnTop"
                                        value={formData.writingsOnTop}
                                        onChange={handleInputChange}
                                        className="w-full bg-white text-orange-950 font-medium p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Do you require a Design?
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center text-orange-950 font-medium">
                                            <input
                                                type="radio"
                                                name="designOption"
                                                value="I have one already"
                                                checked={formData.designOption === "I have one already"}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            I have one already
                                        </label>
                                        <label className="flex items-center text-orange-950 font-medium">
                                            <input
                                                type="radio"
                                                name="designOption"
                                                value="Yes I do"
                                                checked={formData.designOption === "Yes I do"}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Yes I do
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {formData.designOption === "I have one already" && (
                                    <motion.div
                                        className="mt-6"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <label className="block">
                                            <span className="sr-only">Choose file</span>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    id="file-upload"
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <Upload className="h-5 w-5 text-gray-400 mr-2" />
                                                    <span className="truncate">
                                                    {formData.designFile
                                                        ? formData.designFile.name
                                                        : 'Upload your design (Max: 10MB)'}
                                                </span>
                                                </label>
                                                <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, SVG</p>
                                            </div>
                                        </label>
                                    </motion.div>
                                )}

                                {formData.designOption === "Yes I do" && (
                                    <motion.div
                                        className="mt-6"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                                            <div className="text-sm text-gray-700 mb-2">
                                                Our AI will generate custom cake designs based on your specifications.
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGenerateDesigns}
                                                disabled={isGenerating}
                                                className={`w-full px-4 py-2 text-white rounded-md transition-colors ${
                                                    isGenerating 
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-pink-600 hover:bg-pink-700'
                                                }`}
                                            >
                                                {isGenerating ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                        Generating Designs...
                                                    </div>
                                                ) : 'Generate AI Designs'}
                                            </button>
                                        </div>

                                        {generatedImages.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {generatedImages.map((imageUrl, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleDesignSelect(imageUrl)}
                                                        className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                                                            selectedDesignUrl === imageUrl 
                                                                ? 'border-pink-500 scale-105' 
                                                                : 'border-transparent hover:border-pink-300'
                                                        }`}
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Design ${index + 1}`}
                                                            className="w-full h-auto"
                                                        />
                                                        {selectedDesignUrl === imageUrl && (
                                                            <div className="absolute inset-0 bg-pink-500 bg-opacity-20 flex items-center justify-center">
                                                                <div className="bg-white rounded-full p-2">
                                                                    <CheckCircle className="h-6 w-6 text-pink-500" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="form-group mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full bg-white text-orange-950 font-medium p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                ></textarea>
                                <div className="text-xs text-gray-500 mt-1">
                                    {formData.additionalNotes.split(/\s+/).filter(Boolean).length}/100 words
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="mt-8 bg-gradient-to-br from-white to-pink-50 p-8 rounded-2xl shadow-xl w-full border border-pink-100"
                        variants={itemVariants}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-6 md:mb-0 w-full max-w-md">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-pink-100/50">
                                    <div className="flex justify-between items-center text-sm group transition-all duration-300 hover:bg-pink-50/50 p-2 rounded-lg">
                                        <span className="font-medium text-gray-700 flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-pink-400 mr-2"></div>
                                            Base Cake
                                        </span>
                                        <span className="text-gray-900 font-semibold">Rs. {prices.baseType[formData.baseType]}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm group transition-all duration-300 hover:bg-pink-50/50 p-2 rounded-lg">
                                        <span className="font-medium text-gray-700 flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                                            Weight
                                        </span>
                                        <span className="text-gray-900 font-semibold">
                                            Rs. {prices.cakeWeight[formData.cakeWeight]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm group transition-all duration-300 hover:bg-pink-50/50 p-2 rounded-lg">
                                        <span className="font-medium text-gray-700 flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-rose-400 mr-2"></div>
                                            Toppings
                                        </span>
                                        <span className="text-gray-900 font-semibold">Rs. {prices.toppings[formData.toppings]}</span>
                                    </div>
                                    {formData.pickupOption === 'Delivery' && (
                                        <div className="flex justify-between items-center text-sm group transition-all duration-300 hover:bg-pink-50/50 p-2 rounded-lg">
                                            <span className="font-medium text-gray-700 flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-orange-400 mr-2"></div>
                                                Delivery Fee
                                            </span>
                                            <span className="text-gray-900 font-semibold">Rs. 500</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-pink-100">
                                        <span className="text-lg font-bold text-gray-800">Total</span>
                                        <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                            Rs. {price}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="w-full md:w-auto flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg transform transition-all duration-300 md:ml-8"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </motion.button>
                        </div>
                    </motion.div>
                </form>

                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="flex items-center justify-center mb-4 text-pink-600">
                                    <AlertCircle className="h-12 w-12" />
                                </div>
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Important Notice</h3>
                                    <p className="text-gray-700">{modalMessage}</p>
                                </div>
                                <div className="flex justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowModal(false)}
                                        className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <Footer />
        </div>
    );
};

export default CakeOrderForm;
