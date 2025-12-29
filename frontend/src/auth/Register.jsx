import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Upload, AtSign } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                profilePicture: file
            });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'confirmPassword') {
                submitData.append(key, formData[key]);
            }
        });

        try {
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                body: submitData
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Registration successful!');
                navigate('/login');
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            toast.error('An error occurred during registration');
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            
            <main className="flex-grow flex items-center justify-center px-4 py-12 mt-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-5xl grid grid-cols-2 gap-8"
            >
                    {/* Left Column - Profile Picture Upload */}
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                            {previewImage ? (
                    <img 
                                    src={previewImage} 
                                    alt="Profile Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-24 h-24 text-gray-400" />
                            )}
                            <input
                                type="file"
                                id="profilePicture"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="profilePicture"
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Upload className="w-8 h-8 text-white" />
                            </label>
                        </div>
                        <p className="text-gray-600 text-center">
                            Click to upload your profile picture
                        </p>
                </div>

                    {/* Right Column - Registration Form */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Create Account</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                    <label className="block text-gray-700 mb-2">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    required
                                />
                                    </div>
                            </div>
                            <div>
                                    <label className="block text-gray-700 mb-2">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    required
                                />
                                    </div>
                            </div>
                        </div>

                        <div>
                                <label className="block text-gray-700 mb-2">Username</label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                                </div>
                        </div>

                        <div>
                                <label className="block text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                                </div>
                        </div>

                        <div>
                                <label className="block text-gray-700 mb-2">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                                </div>
                        </div>

                        <div>
                                <label className="block text-gray-700 mb-2">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                                </div>
                        </div>

                        <div>
                                <label className="block text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                                </div>
                        </div>

                        <div>
                                <label className="block text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        required
                                    />
                            </div>
                        </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-lg font-semibold shadow-lg hover:from-pink-700 hover:to-rose-600 transition-all duration-200 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Create Account'
                                )}
                            </motion.button>

                            <p className="text-center text-gray-600">
                            Already have an account?{' '}
                                <Link to="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                                    Sign In
                                </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default Register;
