import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ModalComponent = ({ modalMessage, setShowModal }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="bg-white p-6 rounded-lg shadow-lg z-10 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Date Selection Error</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-2" />
                    <p className="text-gray-600">{modalMessage}</p>

                    <button
                        onClick={() => setShowModal(false)}
                        className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalComponent;