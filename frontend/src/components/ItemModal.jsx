import React from "react";

const ItemModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{item.itemName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
                </div>


                <div className="flex flex-col items-center mt-4">
                    {item.image}
                    <p className="mt-2 text-gray-600">{item.unitPrice}</p>
                    <p className={`mt-1 ${item.status === "In Stock" ? "text-green-600" : "text-red-600"}`}>
                        {item.status}
                    </p>
                </div>

                <div className="mt-6 flex justify-between">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400">
                        Close
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;
