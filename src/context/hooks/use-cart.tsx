import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { IProduct, CartItem, IShippingOption } from '@/commons/types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: IProduct) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, newQuantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    cartCount: number;
    selectedShipping: IShippingOption | null;
    selectShippingOption: (option: IShippingOption | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const localData = localStorage.getItem('shoppingCart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            return [];
        }
    });

    const [selectedShipping, setSelectedShipping] = useState<IShippingOption | null>(null);

    useEffect(() => {
        localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: IProduct) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === productId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setSelectedShipping(null);
    };

    const selectShippingOption = (option: IShippingOption | null) => {
        setSelectedShipping(option);
    };

    const getCartTotal = (): number => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        cartCount,
        selectedShipping,
        selectShippingOption,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
