// LowStockAlert.js
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const LowStockAlert = ({ items, onClose, threshold = 10 }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center mb-4 text-red-600">
                    <FaExclamationTriangle className="mr-2 text-xl" />
                    <h2 className="text-xl font-bold">Low Stock Alert!</h2>
                </div>
                <p className="mb-4">The following items have stock levels below {threshold}:</p>
                <ul className="mb-4 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                        <li key={item._id} className="mb-2 p-2 border-b">
                            <div className="flex items-center">
                                <img src={item.image} alt={item.itemName} className="w-10 h-10 object-cover rounded mr-2" />
                                <div>
                                    <p className="font-semibold">{item.itemName}</p>
                                    <p className="text-red-600">Stock: {item.stockLevel}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LowStockAlert;