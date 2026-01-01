import { useState, useEffect } from 'react';
import { Edit, Trash2, AlertTriangle, Plus, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOW_STOCK_THRESHOLD = 10;
const API_URL = 'http://localhost:8000/admin/inventory';

const AdminInventoryView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();
                setProducts(data);
                checkLowStockItems(data);
            } catch (error) {
                setError("Failed to fetch inventory data");
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete product');

            setProducts(products.filter(p => p._id !== productId));
        } catch (err) {
            setError(err.message);
        }
    };

    const checkLowStockItems = (items) => {
        const lowStockItems = items.filter(item => parseInt(item.stockLevel) < LOW_STOCK_THRESHOLD);
        if (lowStockItems.length > 0) {
            // You can implement notification logic here
            console.log("Low stock items:", lowStockItems);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-300">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-300">Inventory Management</h1>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors shadow-lg flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Product
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && (
                <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700">
                                <th className="px-6 py-3 text-left text-blue-300">Product Name</th>
                                <th className="px-6 py-3 text-left text-blue-300">Category</th>
                                <th className="px-6 py-3 text-left text-blue-300">Price</th>
                                <th className="px-6 py-3 text-left text-blue-300">Stock Level</th>
                                <th className="px-6 py-3 text-left text-blue-300">Status</th>
                                <th className="px-6 py-3 text-center text-blue-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product._id} className={`border-b border-gray-700 ${
                                    index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                                } hover:bg-gray-700/50`}>
                                    <td className="px-6 py-4 text-gray-300">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-300">{product.category}</td>
                                    <td className="px-6 py-4 text-gray-300">${product.price}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`${
                                                parseInt(product.stockLevel) < LOW_STOCK_THRESHOLD 
                                                    ? 'text-red-400' 
                                                    : 'text-gray-300'
                                            }`}>
                                                {product.stockLevel}
                                            </span>
                                            {parseInt(product.stockLevel) < LOW_STOCK_THRESHOLD && (
                                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            product.stockLevel > 0 
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                            {product.stockLevel > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-2">
                                            <button className="p-1 text-blue-400 hover:text-blue-300">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product._id)}
                                                className="p-1 text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StockManagement;
