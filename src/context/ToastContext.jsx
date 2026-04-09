import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastContainer } from '../components/common/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

    const showToast = useCallback((message, type = 'info', link = null) => {
        const id = Math.random().toString(36).substr(2, 9);
        
        // Add toast with link support
        setToasts((prev) => [...prev, { id, message, type, link }]);
        
        // Play notification sound
        audioRef.current.play().catch(e => {
            // Audio blocked by browser policy usually
            console.log("Audio play blocked. User needs to interact with the page first.");
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};
