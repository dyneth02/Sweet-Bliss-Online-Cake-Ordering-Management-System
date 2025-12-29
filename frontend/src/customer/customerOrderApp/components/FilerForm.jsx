import React from 'react';
import { Calendar, Upload } from 'lucide-react';

// Helper component for dropdown icon
const ChevronDown = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const FilterForm = ({ formData, handleInputChange, handleColorChange, handleImageUpload }) => {
    // Fake AI-generated cake designs for demonstration
    const aiDesigns = [
        '/api/placeholder/200/200',
        '/api/placeholder/200/200',
        '/api/placeholder/200/200',
        '/api/placeholder/200/200'
    ];

    // Handle image selection
    const handleDesignSelect = (src) => {
        handleImageUpload(src);
    };

    // Handle file upload (placeholder implementation)
    const handleFileUpload = () => {
        // In a real implementation, you would handle file upload here
        // For now, we'll just use a placeholder image
        const placeholderImageUrl = '/api/placeholder/200/200';
        handleImageUpload(placeholderImageUrl);
        alert('Design uploaded successfully!');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
                {/* Nature of Event */}
                <div>
                    <label className="bg-gray-50 block text-sm font-medium text-gray-700 mb-1 focus:outline-none">
                        Nature of the Event
                    </label>
                    <input
                        type="text"
                        value={formData.natureOfEvent}
                        onChange={(e) => handleInputChange('natureOfEvent', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    />
                </div>

                {/* Base type of the cake */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base type of the cake
                    </label>
                    <div className="relative">
                        <select
                            value={formData.baseType}
                            onChange={(e) => handleInputChange('baseType', e.target.value)}
                            className="w-full p-2 pr-8 border border-gray-300 rounded-md appearance-none bg-white text-gray-900"
                        >
                            <option value="">Select a type</option>
                            <option value="Butter / Oil">Butter / Oil</option>
                            <option value="Sponge">Sponge</option>
                            <option value="Baked Flourless">Baked Flourless</option>
                            <option value="Un-baked Flourless">Un-baked Flourless</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Base Colors */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Colors
                    </label>
                    <div className="flex space-x-2">
                        {[0, 1, 2].map(index => (
                            <div key={index} className="relative">
                                <input
                                    type="color"
                                    value={formData.baseColors[index] || '#ffffff'}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer p-0 overflow-hidden bg-white text-gray-900"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date of Requirement */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Requirement
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.dateOfRequirement}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 cursor-default"
                            placeholder="Click on a date in the calendar"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Cake Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cake Size
                    </label>
                    <div className="relative">
                        <select
                            value={formData.cakeSize}
                            onChange={(e) => handleInputChange('cakeSize', e.target.value)}
                            className="w-full p-2 pr-8 border border-gray-300 rounded-md appearance-none bg-white text-gray-900"
                        >
                            <option value="">Select a size</option>
                            <option value="500g">500g</option>
                            <option value="1kg">1kg</option>
                            <option value="2kg">2kg</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Pickup Option */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Option
                    </label>
                    <div className="relative ">
                        <select
                            value={formData.pickupOption}
                            onChange={(e) => handleInputChange('pickupOption', e.target.value)}
                            className="w-full p-2 pr-8 border border-gray-300 rounded-md appearance-none bg-white text-gray-900"
                        >
                            <option value="">Select an option</option>
                            <option value="Self Pickup">Self Pickup</option>
                            <option value="Delivery">Delivery</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    {formData.pickupOption === 'Delivery' && (
                        <div className="mt-1 text-xs text-gray-500">
                            *Note: delivery will apply additional charges.
                        </div>
                    )}
                </div>

                {/* Toppings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Toppings
                    </label>
                    <div className="relative">
                        <select
                            value={formData.toppings}
                            onChange={(e) => handleInputChange('toppings', e.target.value)}
                            className="w-full p-2 pr-8 border border-gray-300 rounded-md appearance-none bg-white text-gray-900"
                        >
                            <option value="">Select a topping</option>
                            <option value="Sprinkles">Sprinkles</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Plums">Plums</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    {formData.toppings && (
                        <div className="mt-1 text-xs text-gray-500">
                            *Note: delivery will apply additional charges.
                        </div>
                    )}
                </div>

                {/* Writings on Top */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Writings on Top
                    </label>
                    <input
                        type="text"
                        value={formData.writingsOnTop}
                        onChange={(e) => handleInputChange('writingsOnTop', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        placeholder="Enter text for cake"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                        *Note: delivery will apply additional charges.
                    </div>
                </div>

                {/* Design Requirement */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Do you require a Design?
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="requireDesign"
                                value="I have one already"
                                checked={formData.requireDesign === 'I have one already'}
                                onChange={(e) => handleInputChange('requireDesign', e.target.value)}
                                className="mr-2 bg-white text-gray-900"
                            />
                            I have one already
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="requireDesign"
                                value="Yes I do"
                                checked={formData.requireDesign === 'Yes I do'}
                                onChange={(e) => handleInputChange('requireDesign', e.target.value)}
                                className="mr-2 bg-white text-gray-900"
                            />
                            Yes I do
                        </label>
                    </div>

                    {formData.requireDesign === 'I have one already' && (
                        <div className="mt-2">
                            <div className="grid grid-cols-4 gap-2">
                                {aiDesigns.map((src, index) => (
                                    <div
                                        key={index}
                                        className="relative border border-gray-200 rounded-md overflow-hidden cursor-pointer"
                                        onClick={() => handleDesignSelect(src)}
                                    >
                                        <img
                                            src={src}
                                            alt={`Design ${index + 1}`}
                                            className="w-full h-24 object-cover"
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm">AI generated design</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                (AI image generation system temporarily unavailable)
                            </div>
                        </div>
                    )}

                    {formData.requireDesign === 'Yes I do' && (
                        <div className="mt-2">
                            <button
                                className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-rose-400 hover:bg-gray-50"
                                onClick={handleFileUpload}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Design
                            </button>
                        </div>
                    )}
                </div>

                {/* Additional Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                    </label>
                    <textarea
                        value={formData.additionalNotes}
                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md h-24 bg-white text-gray-900"
                        placeholder="Any special requirements or instructions?"
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterForm;
