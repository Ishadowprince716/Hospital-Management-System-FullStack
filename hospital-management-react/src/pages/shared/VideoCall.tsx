import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetTelehealthSessionQuery } from '../../store/api/telehealthApiSlice';
import type { RootState } from '../../store';
import { Loader2, VideoOff, PhoneOff } from 'lucide-react';

interface JitsiMeetExternalApi {
    addEventListeners: (listeners: Record<string, () => void>) => void;
    dispose: () => void;
}

interface JitsiMeetOptions {
    roomName: string;
    width: string;
    height: string;
    parentNode: HTMLElement;
    userInfo: {
        displayName: string;
        email: string;
    };
    interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: string[];
    };
}

type JitsiMeetExternalApiConstructor = new (
    domain: string,
    options: JitsiMeetOptions
) => JitsiMeetExternalApi;

declare global {
    interface Window {
        JitsiMeetExternalAPI?: JitsiMeetExternalApiConstructor;
    }
}

const VideoCall: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<JitsiMeetExternalApi | null>(null);
    const [jitsiApi, setJitsiClient] = useState<JitsiMeetExternalApi | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const parsedAppointmentId = Number(appointmentId);
    const hasValidAppointmentId = Number.isInteger(parsedAppointmentId) && parsedAppointmentId > 0;

    const { data: sessionData, isLoading, error } = useGetTelehealthSessionQuery(parsedAppointmentId, {
        skip: !hasValidAppointmentId,
    });

    useEffect(() => {
        // Load Jitsi script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            jitsiApiRef.current?.dispose();
            jitsiApiRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (hasValidAppointmentId && scriptLoaded && sessionData?.data && jitsiContainerRef.current && !jitsiApiRef.current && window.JitsiMeetExternalAPI) {
            const roomName = sessionData.data.roomName;
            if (!roomName) {
                return;
            }

            const domain = 'meet.jit.si';
            const options: JitsiMeetOptions = {
                roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: user?.fullName || 'HMS User',
                    email: user?.email || '',
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                }
            };
            const api = new window.JitsiMeetExternalAPI(domain, options);

            api.addEventListeners({
                readyToClose: () => {
                    navigate(-1);
                },
                videoConferenceTerminated: () => {
                    navigate(-1);
                }
            });

            jitsiApiRef.current = api;
            setJitsiClient(api);
        }
    }, [hasValidAppointmentId, navigate, scriptLoaded, sessionData, user?.email, user?.fullName]);

    if (!hasValidAppointmentId) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-900 p-6 text-center text-white">
                <VideoOff className="mb-4 h-16 w-16 text-amber-400" />
                <h1 className="mb-2 text-2xl font-bold">Appointment Required</h1>
                <p className="max-w-md text-gray-400">Open Telehealth from a scheduled appointment so we can connect you to the correct room.</p>
                <button
                    onClick={() => navigate('/telehealth')}
                    className="mt-6 rounded-lg bg-[var(--primary)] px-6 py-2 font-medium text-white"
                >
                    Telehealth Help
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)] mb-4" />
                <p className="text-lg">Initializing Secure Video Link...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6 text-center">
                <VideoOff className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Telehealth Link Error</h1>
                <p className="text-gray-400 max-w-md">We couldn't establish a secure connection to the virtual clinic. Please ensure the appointment is still active.</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="mt-6 px-6 py-2 bg-[var(--primary)] rounded-lg font-medium"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col">
            {/* Overlay UI */}
            <div className="absolute top-4 left-4 z-[10001] flex items-center gap-3">
                <div className="p-2 bg-red-600 text-white rounded-lg flex items-center gap-2 text-xs font-bold animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    LIVE CONSULTATION
                </div>
                <div className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white text-sm font-medium border border-white/20">
                    Room: {sessionData?.data?.roomName}
                </div>
            </div>

            <div className="absolute top-4 right-4 z-[10001]">
                <button 
                    onClick={() => {
                        jitsiApi?.dispose();
                        jitsiApiRef.current = null;
                        navigate(-1);
                    }}
                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    title="End Call"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>

            {/* Jitsi Container */}
            <div ref={jitsiContainerRef} className="flex-1 w-full" />
        </div>
    );
};

export default VideoCall;
