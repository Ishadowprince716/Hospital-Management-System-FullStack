import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import type { RootState } from '../store';
import { toast } from 'react-hot-toast';
import { WS_BASE } from '../api';

const WebSocketListener: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const username = user?.username;

    useEffect(() => {
        if (!isAuthenticated || !username) return;

        let isActive = true;
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
            reconnectDelay: 5000,
            debug: () => {}, // Disable logging for production feel
        });

        stompClient.onConnect = () => {
            if (!isActive) return;

            // Subscribe to Global Notifications
            stompClient.subscribe('/topic/notifications', (message: IMessage) => {
                const data = JSON.parse(message.body);
                toast(data.message, {
                    icon: data.type === 'SUCCESS' ? '✅' : '🔔',
                    duration: 5000,
                });
            });

            // Subscribe to Private User Notifications
            stompClient.subscribe(`/user/${username}/queue/notifications`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                toast.success(data.message, {
                    icon: '🚀',
                    duration: 6000,
                });
            });
        };

        stompClient.onStompError = (frame) => {
            if (isActive) {
                console.warn('Live notifications are temporarily unavailable:', frame.headers.message || frame.body);
            }
        };

        stompClient.onWebSocketError = (error) => {
            if (isActive) {
                console.warn('Live notifications are temporarily unavailable:', error);
            }
        };

        stompClient.activate();

        return () => {
            isActive = false;
            void stompClient.deactivate();
        };
    }, [isAuthenticated, username]);

    return null; // This component doesn't render anything, it just listens
};

export default WebSocketListener;
