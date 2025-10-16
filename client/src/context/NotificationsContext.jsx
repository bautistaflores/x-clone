// src/context/NotificationContext.jsx
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import useNotifications from '../hooks/useNotifications';

const NotificationContext = createContext();

export const useNotificationContext = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    
    const notificationData = useNotifications(user?.id);

    return (
        <NotificationContext.Provider value={notificationData}>
            {children}
        </NotificationContext.Provider>
    );
};