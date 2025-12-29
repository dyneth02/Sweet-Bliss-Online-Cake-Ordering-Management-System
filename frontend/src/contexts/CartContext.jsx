import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart items on mount
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/cart?email=lochana@gmail.com `, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch cart');
            const data = await response.json();
            setCart(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError(error.message);
        }
    };

    const addToCart = async (item, itemType) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let response;
            if (itemType === 'cake') {
                response = await fetch("http://localhost:8000/api/cart/add-cake", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: "lochana@gmail.com",
                        cakeDetails: {
                            natureOfEvent: item.natureOfEvent,
                            baseTypeOfCake: item.baseTypeOfCake,
                            dateOfRequirement: item.dateOfRequirement,
                            cakeSize: item.cakeSize,
                            baseColors: item.baseColors,
                            pickupOption: item.pickupOption,
                            toppings: item.toppings,
                            writingsOnTop: item.writingsOnTop,
                            imageUrl: item.imageUrl,
                            additionalNotes: item.additionalNotes,
                            price: item.price
                        }
                    }),
                });
            } else {
                response = await fetch("http://localhost:8000/api/cart/add", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: "lochana@gmail.com",
                        itemName: item.itemName,
                        quantity: item.quantity || 1
                    }),
                });
            }

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }

            const data = await response.json();
            setCart(data.data);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            loading, 
            error, 
            addToCart,
            setCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};
