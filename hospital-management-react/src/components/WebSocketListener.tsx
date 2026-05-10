import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import type { RootState } from '../store';
import { toast } from 'react-hot-toast';

const WebSocketListener: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const username = user?.username;

    useEffect(() => {
        if (!isAuthenticated || !username) return;

        let isActive = true;
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => {}; // Disable logging for production feel

        stompClient.connect({}, () => {
            if (!isActive) return;

            // Subscribe to Global Notifications
            stompClient.subscribe('/topic/notifications', (message) => {
                const data = JSON.parse(message.body);
                toast(data.message, {
                    icon: data.type === 'SUCCESS' ? '✅' : '🔔',
                    duration: 5000,
                });
            });

            // Subscribe to Private User Notifications
            stompClient.subscribe(`/user/${username}/queue/notifications`, (message) => {
                const data = JSON.parse(message.body);
                toast.success(data.message, {
                    icon: '🚀',
                    duration: 6000,
                });
            });
        }, (error) => {
            if (isActive) {
                console.warn('Live notifications are temporarily unavailable:', error);
            }
        });

        return () => {
            isActive = false;
            if (stompClient.connected) {
                stompClient.disconnect(() => {});
            } else {
                socket.close();
            }
        };
    }, [isAuthenticated, username]);

    return null; // This component doesn't render anything, it just listens
};

export default WebSocketListener;
