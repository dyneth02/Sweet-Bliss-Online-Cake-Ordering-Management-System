import React from 'react';
import { X } from 'lucide-react';

// Helper component for alert icon
const AlertCircle = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ModalComponent = ({ modalMessage, setShowModal }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowModal(false)}
            ></div>
            <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full">
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <AlertCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Date Selection Error
                    </h3>
                    <p className="text-gray-600">{modalMessage}</p>
                    <button
                        onClick={() => setShowModal(false)}
                        className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalComponent;
