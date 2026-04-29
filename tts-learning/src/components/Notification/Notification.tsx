import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { createContext, useContext } from 'react';

interface NotificationContextType {
    api: NotificationInstance;
    showNotification: (
        type: 'success' | 'error' | 'info' | 'warning',
        message: string,
        description?: string,
        duration?: number
    ) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [api, contextHolder] = notification.useNotification();

    const showNotification = (
        type: 'success' | 'error' | 'info' | 'warning',
        message: string,
        description?: string,
        duration: number = 3
    ) => {
        api[type]({
            message,
            description,
            duration,
            placement: 'topRight'
            // style: {
            //     marginTop: '20px'
            // }
        });
    };

    return (
        <NotificationContext.Provider value={{ api, showNotification }}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};

export const useShowNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useShowNotification must be used within a NotificationProvider');
    }
    return context.showNotification;
};
