import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import hero1 from '../assets/cakeImage (1).png';
import hero2 from '../assets/cakeImage (2).png';
import hero3 from '../assets/cakeImage (4).png';
import hero4 from '../assets/cakeImage (5).png';
import hero5 from '../assets/cakeImage (6).png';
import hero6 from '../assets/cakeImage (7).png';
import hero7 from '../assets/cakeImage (8).png';

const HomePage = () => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const heroImages = [
        hero1,
        hero2,
        hero3,
        hero4,
        hero5,
        hero6,
        hero7
    ];

    // Image carousel auto-rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            
            <main className="flex-grow pt-24"> {/* Adjusted for fixed header */}
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-8 py-12 flex items-center">
                    <div className="w-1/2 pr-12">
                        <h1 className="text-5xl font-bold text-gray-800 mb-6">
                            Create Your Perfect Cake
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            <span>Welcome to Sweet Bliss : Crafted with Love, Designed for Moments That Matter.</span>
                            At Sweet Bliss, we don’t just bake cakes, we bring your sweetest dreams to life.

                        </p>
                        <button 
                            onClick={() => navigate('/ordercake')}
                            className="bg-pink-600 text-white px-8 py-3 rounded-lg 
                                     hover:bg-pink-700 transition-colors shadow-lg"
                        >
                            Create Your Cake
                        </button>
                    </div>
                    <div className="w-1/2 relative h-[500px]">
                        {heroImages.map((img, index) => (
                            <motion.img
                                key={index}
                                src={img}
                                alt={`Cake ${index + 1}`}
                                className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        ))}
                    </div>
                </section>

                {/* Bento Grid Gallery */}
                <section className="max-w-7xl mx-auto px-8 py-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Creations</h2>
                    <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px]">
                        <div className="col-span-2 row-span-2 bg-gray-200 rounded-lg overflow-hidden">
                            <img src="http://localhost:8000/uploads/cake_images/cake_1745735548368.jpg" alt="Cake 1" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-gray-200 rounded-lg overflow-hidden">
                            <img src="http://localhost:8000/uploads/cake_images/cake_1745750894708.jpg" alt="Cake 2" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-gray-200 rounded-lg overflow-hidden">
                            <img src="http://localhost:8000/uploads/cake_images/cake_1745756761158.jpg" alt="Cake 3" className="w-full h-full object-cover" />
                        </div>
                        <div className="col-span-2 bg-gray-200 rounded-lg overflow-hidden">
                            <img src="http://localhost:8000/uploads/cake_images/cake_1745771050861.jpg" alt="Cake 4" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </section>


            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
