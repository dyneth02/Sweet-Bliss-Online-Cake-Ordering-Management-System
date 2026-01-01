import { useState, useEffect } from 'react';
import { Edit, Trash2, AlertTriangle, Plus, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "http://localhost:8000/admin";

const AdminInventoryView = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        itemName: '',
        image: '',
        unitPrice: '',
        stockLevel: '',
        availability: 'In Stock'
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [previewHoverImage, setPreviewHoverImage] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return imagePath.includes('https') ? imagePath : `http://localhost:8000${imagePath}`;
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch(`${API_URL}/inventory`);
            const data = await response.json();
            setInventory(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch inventory '+err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`${API_URL}/inventory/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setInventory(inventory.filter(item => item._id !== id));
            } else {
                throw new Error('Failed to delete item');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddNew = () => {
        setSelectedItem(null);
        setFormData({
            itemName: '',
            image: '',
            unitPrice: '',
            stockLevel: '',
            availability: 'In Stock'
        });
        setPreviewImage(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            itemName: item.itemName,
            image: item.image,
            unitPrice: item.unitPrice,
            stockLevel: item.stockLevel,
            availability: item.availability
        });
        setShowModal(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid image file (JPEG, PNG, or GIF)');
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('itemName', formData.itemName);
            formDataToSend.append('unitPrice', formData.unitPrice);
            formDataToSend.append('stockLevel', formData.stockLevel);
            formDataToSend.append('availability', formData.availability);
            
            // Only append image if it's a new file
            if (formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            }

            const url = selectedItem
                ? `${API_URL}/inventory/update/${selectedItem._id}`
                : `${API_URL}/inventory`;

            const response = await fetch(url, {
                method: selectedItem ? 'PUT' : 'POST',
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                fetchInventory(); // Refresh the inventory list
                setShowModal(false);
                setSelectedItem(null);
                setFormData({
                    itemName: '',
                    image: '',
                    unitPrice: '',
                    stockLevel: '',
                    availability: 'In Stock'
                });
                setPreviewImage(null);
            } else {
                throw new Error(data.message || 'Failed to save item');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const ImagePreviewOverlay = ({ imageSrc, mousePosition }) => {
        if (!imageSrc || !mousePosition) return null;

        return (
            <motion.div 
                className="fixed z-50 pointer-events-none"
                style={{
                    left: mousePosition.x + 20, // 20px right shift from cursor
                    top: mousePosition.y - 320, // Position above cursor
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
            >
                <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700 bg-gray-900">
                    <img 
                        src={imageSrc} 
                        alt="Preview"
                        className="min-w-[250px] min-h-[250px] max-w-[250px] max-h-[250px] object-cover"
                    />
                </div>
            </motion.div>
        );
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-300">
            <AnimatePresence>
                <ImagePreviewOverlay 
                    imageSrc={previewHoverImage} 
                    mousePosition={mousePosition}
                />
            </AnimatePresence>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-300">Inventory Management</h1>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors shadow-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Item
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
                            <tr className="bg-gray-800/50">
                                <th className="px-6 py-3 text-left text-blue-300">Product Name</th>
                                <th className="px-6 py-3 text-left text-blue-300">Image</th>
                                <th className="px-6 py-3 text-left text-blue-300">Price</th>
                                <th className="px-6 py-3 text-left text-blue-300">Stock Level</th>
                                <th className="px-6 py-3 text-center text-blue-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {inventory.map((item, index) => (
                                <tr key={item._id} className={`${
                                    index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                                } hover:bg-gray-700/50 transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.itemName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div 
                                            className="relative cursor-zoom-in"
                                            onMouseEnter={() => setPreviewHoverImage(getImageUrl(item.image))}
                                            onMouseLeave={() => setPreviewHoverImage(null)}
                                        >
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.itemName}
                                                className="h-12 w-12 object-cover rounded-lg border border-gray-700"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rs.{item.unitPrice}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className={`${
                                                parseInt(item.stockLevel) < 10 
                                                    ? 'text-red-400' 
                                                    : 'text-gray-300'
                                            }`}>
                                                {item.stockLevel}
                                            </span>
                                            {parseInt(item.stockLevel) < 10 && (
                                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
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

            {/* Modified Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-700"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-blue-300">
                                    {selectedItem ? 'Edit Item' : 'Add New Item'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedItem(null);
                                        setPreviewImage(null);
                                        setFormData({
                                            itemName: '',
                                            image: '',
                                            unitPrice: '',
                                            stockLevel: '',
                                            availability: 'In Stock'
                                        });
                                    }}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Item Name"
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300"
                                    required
                                />
                                
                                {/* Image Upload Section */}
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif"
                                        onChange={handleImageUpload}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300"
                                    />
                                    {previewImage && (
                                        <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage(null);
                                                    setFormData(prev => ({ ...prev, image: '' }));
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="number"
                                    placeholder="Unit Price"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Stock Level"
                                    value={formData.stockLevel}
                                    onChange={(e) => setFormData({...formData, stockLevel: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300"
                                    required
                                />
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setPreviewImage(null);
                                        }}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors shadow-lg"
                                    >
                                        {selectedItem ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminInventoryView;







