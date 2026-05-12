import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import type { RootState } from '../store';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api, { WS_BASE } from '../api';
import {
    requestTelehealthNotificationPermission,
    showTelehealthBrowserNotification,
    startIncomingRingtone,
    stopIncomingRingtone,
    playEndTone,
} from '../utils/telehealthAlerts';

interface TelehealthSocketPayload {
    event?: 'CALL_INVITE' | 'CALL_DECLINED' | 'CALL_ENDED';
    appointmentId?: string;
    callerName?: string;
    message?: string;
    title?: string;
    targetUsername?: string;
    targetUserId?: string;
}

const WebSocketListener: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const username = user?.username;
    const navigate = useNavigate();

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

            stompClient.subscribe('/topic/telehealth', (message: IMessage) => {
                const data = JSON.parse(message.body) as TelehealthSocketPayload;
                const isForCurrentUser =
                    data.targetUsername === username ||
                    data.targetUserId === String(user?.id);

                if (!isForCurrentUser || !data.appointmentId) return;

                const meetingUrl = `/telehealth/${data.appointmentId}`;
                const notificationTitle = data.title || 'Telehealth consultation';
                const notificationMessage = data.message || 'A video consultation is ready.';

                if (data.event === 'CALL_INVITE') {
                    startIncomingRingtone();
                    void requestTelehealthNotificationPermission().then(() => {
                        void showTelehealthBrowserNotification(notificationTitle, notificationMessage, meetingUrl);
                    }).catch(() => undefined);

                    toast.custom((toastInstance) => (
                        <div className="w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-2xl">
                            <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-3 text-white">
                                <p className="text-xs font-bold uppercase tracking-[0.18em]">Incoming telehealth call</p>
                                <p className="mt-1 text-base font-semibold">{data.callerName || 'HMS Telehealth'}</p>
                            </div>
                            <div className="space-y-4 p-4">
                                <p className="text-sm leading-6 text-slate-600">{notificationMessage}</p>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700"
                                        onClick={() => {
                                            stopIncomingRingtone();
                                            toast.dismiss(toastInstance.id);
                                            navigate(meetingUrl);
                                        }}
                                    >
                                        Join call
                                    </button>
                                    <button
                                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => {
                                            stopIncomingRingtone();
                                            toast.dismiss(toastInstance.id);
                                            void api.post(`/telehealth/session/${data.appointmentId}/decline`);
                                        }}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    ), { duration: 30000 });
                    return;
                }

                stopIncomingRingtone();
                if (data.event === 'CALL_ENDED') {
                    playEndTone();
                }
                toast(notificationMessage, {
                    icon: data.event === 'CALL_DECLINED' ? 'Missed' : 'Call',
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
    }, [isAuthenticated, navigate, user?.id, username]);

    return null; // This component doesn't render anything, it just listens
};

export default WebSocketListener;
