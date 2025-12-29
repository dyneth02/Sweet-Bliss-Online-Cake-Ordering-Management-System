// Utility function to dispatch cart update event
export const dispatchCartUpdate = () => {
    window.dispatchEvent(new Event('cartUpdated'));
};

// Function to get total items in cart
export const getCartItemCount = () => {
    const cartStoreItems = JSON.parse(localStorage.getItem('cartStoreItems') || '[]');
    const customCakes = JSON.parse(localStorage.getItem('customCakes') || '[]');
    
    const storeItemCount = cartStoreItems.reduce((total, item) => total + (item.quantity || 0), 0);
    const cakeItemCount = customCakes.length;
    
    return storeItemCount + cakeItemCount;
}; 