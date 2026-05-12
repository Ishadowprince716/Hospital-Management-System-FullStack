import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import {
    useEndTelehealthSessionMutation,
    useGetTelehealthIceConfigQuery,
    useGetTelehealthSessionQuery,
    useJoinTelehealthSessionMutation,
    useStartTelehealthSessionMutation,
} from '../../store/api/telehealthApiSlice';
import type { RootState } from '../../store';
import { WS_BASE } from '../../api';
import {
    Bell,
    BellRing,
    Camera,
    CheckCircle2,
    Copy,
    Loader2,
    Mic,
    MicOff,
    PhoneCall,
    PhoneOff,
    ShieldCheck,
    Video,
    VideoOff,
    Activity,
    MonitorUp,
    Users,
} from 'lucide-react';
import {
    requestTelehealthNotificationPermission,
    setTelehealthInCall,
    stopIncomingRingtone,
    unlockTelehealthAudio,
} from '../../utils/telehealthAlerts';

type TelehealthQueryError = {
    status?: number | string;
    data?: { message?: string };
    error?: string;
};

type SignalMessage = {
    appointmentId: number;
    senderId: string;
    senderName?: string;
    senderRole?: string;
    sentAt?: string;
    type: 'join' | 'leave' | 'offer' | 'answer' | 'candidate' | 'renegotiate' | 'end';
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
    participants?: SignalParticipant[];
};

type SignalParticipant = {
    senderId: string;
    senderName?: string;
    senderRole?: string;
};

type ConnectionStateLabel = 'Waiting' | 'Peer found' | 'Connecting' | 'Connected' | 'Network blocked' | 'Retrying';

const getShouldInitiateOffer = (participants: SignalParticipant[], localSenderId: string) => {
    const peerIds = participants
        .map((participant) => participant.senderId)
        .filter(Boolean)
        .sort((first, second) => first.localeCompare(second));

    if (peerIds.length < 2) return false;
    return peerIds[0] === localSenderId;
};

const getRoleLabel = (role?: string) => role === 'DOCTOR' ? 'Start Consultation' : 'Join Consultation';

const getSessionStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
        READY: 'Room ready',
        CALLING: 'Calling participant',
        ACTIVE: 'Live consultation',
        DECLINED: 'Call declined',
        ENDED: 'Call ended',
    };
    return labels[status || 'READY'] || status || 'READY';
};

const getTelehealthErrorCopy = (error: unknown) => {
    const queryError = error as TelehealthQueryError | undefined;
    const status = queryError?.status;
    const apiMessage = queryError?.data?.message || queryError?.error;

    if (status === 404 || apiMessage?.toLowerCase().includes('appointment not found')) {
        return {
            title: 'Appointment not found',
            message: 'This video room is not linked to an active appointment. Open your appointments and start the call from the correct visit.',
        };
    }

    if (status === 401 || status === 403) {
        return {
            title: 'Access needed',
            message: 'Please log in with the doctor or patient account connected to this appointment, then try again.',
        };
    }

    return {
        title: 'Room setup paused',
        message: apiMessage || 'We could not prepare the virtual clinic room. Please retry, or open the consultation from your appointments list.',
    };
};

const VideoCall: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const stompRef = useRef<Client | null>(null);
    const hasRemoteRef = useRef(false);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const participantsRef = useRef<SignalParticipant[]>([]);
    const isMakingOfferRef = useRef(false);
    const makeOfferRef = useRef<() => Promise<void>>(async () => undefined);
    const reconnectTimerRef = useRef<number | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const senderId = useMemo(() => crypto.randomUUID(), []);
    const [callStarted, setCallStarted] = useState(false);
    const [alertsReady, setAlertsReady] = useState(localStorage.getItem('telehealthAudioEnabled') === 'true');
    const [isStarting, setIsStarting] = useState(false);
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [connectionLabel, setConnectionLabel] = useState<ConnectionStateLabel>('Waiting');
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [remoteConnected, setRemoteConnected] = useState(false);
    const [remoteParticipant, setRemoteParticipant] = useState<string | null>(null);
    const [meetingCopied, setMeetingCopied] = useState(false);
    const parsedAppointmentId = Number(appointmentId);
    const hasValidAppointmentId = Number.isInteger(parsedAppointmentId) && parsedAppointmentId > 0;

    const [startTelehealthSession] = useStartTelehealthSessionMutation();
    const [endTelehealthSession] = useEndTelehealthSessionMutation();
    const [joinTelehealthSession] = useJoinTelehealthSessionMutation();
    const { data: iceConfigData } = useGetTelehealthIceConfigQuery();
    const { data: sessionData, isLoading, error } = useGetTelehealthSessionQuery(parsedAppointmentId, {
        skip: !hasValidAppointmentId,
    });

    const iceServers = useMemo<RTCIceServer[]>(() => {
        const servers = iceConfigData?.data?.iceServers;
        return servers?.length
            ? servers
            : [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' },
            ];
    }, [iceConfigData?.data?.iceServers]);

    const sendSignal = useCallback((message: Omit<SignalMessage, 'appointmentId' | 'senderId' | 'senderName'>) => {
        const client = stompRef.current;
        if (!client?.connected || !hasValidAppointmentId) return;
        client.publish({
            destination: '/app/telehealth.signal',
            body: JSON.stringify({
                appointmentId: parsedAppointmentId,
                senderId,
                senderName: user?.fullName || user?.username || 'HMS User',
                senderRole: user?.role,
                ...message,
            }),
        });
    }, [hasValidAppointmentId, parsedAppointmentId, senderId, user?.fullName, user?.role, user?.username]);

    const cleanupCall = useCallback(() => {
        setTelehealthInCall(false);
        stompRef.current?.deactivate();
        stompRef.current = null;
        peerRef.current?.close();
        peerRef.current = null;
        pendingCandidatesRef.current = [];
        participantsRef.current = [];
        isMakingOfferRef.current = false;
        reconnectAttemptsRef.current = 0;
        if (reconnectTimerRef.current !== null) {
            window.clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        screenStreamRef.current?.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        cameraVideoTrackRef.current = null;
        hasRemoteRef.current = false;
        setRemoteConnected(false);
        setRemoteParticipant(null);
        setIsScreenSharing(false);
    }, []);

    const handleEndCall = useCallback(async () => {
        stopIncomingRingtone();
        setTelehealthInCall(false);
        sendSignal({ type: 'end' });
        cleanupCall();
        if (hasValidAppointmentId) {
            try {
                await endTelehealthSession(parsedAppointmentId).unwrap();
            } catch {
                // Navigation should still work even if the end-call API is temporarily unavailable.
            }
        }
        navigate(-1);
    }, [cleanupCall, endTelehealthSession, hasValidAppointmentId, navigate, parsedAppointmentId, sendSignal]);

    const flushPendingCandidates = useCallback(async () => {
        const peer = peerRef.current;
        if (!peer?.remoteDescription) return;

        const candidates = [...pendingCandidatesRef.current];
        pendingCandidatesRef.current = [];
        for (const candidate of candidates) {
            try {
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (candidateError) {
                console.warn('Telehealth ICE candidate skipped:', candidateError);
            }
        }
    }, []);

    const scheduleNegotiationRetry = useCallback(() => {
        if (reconnectTimerRef.current !== null) return;

        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        const delayMs = Math.min(8000, 800 * (2 ** Math.min(4, attempt - 1)));
        setConnectionLabel('Retrying');

        reconnectTimerRef.current = window.setTimeout(() => {
            reconnectTimerRef.current = null;
            if (!callStarted) return;
            void makeOfferRef.current();
        }, delayMs);
    }, [callStarted]);

    const createPeerConnection = useCallback(() => {
        if (peerRef.current) return peerRef.current;

        const peer = new RTCPeerConnection({ iceServers });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({ type: 'candidate', candidate: event.candidate.toJSON() });
            }
        };

        peer.onicegatheringstatechange = () => {
            if (peer.iceGatheringState === 'gathering') setConnectionLabel('Connecting');
        };

        peer.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current && remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
                if (!hasRemoteRef.current) {
                    hasRemoteRef.current = true;
                    setRemoteConnected(true);
                    void joinTelehealthSession(parsedAppointmentId);
                }
            }
        };

        peer.onconnectionstatechange = () => {
            const state = peer.connectionState;
            if (state === 'connected') {
                reconnectAttemptsRef.current = 0;
                if (reconnectTimerRef.current !== null) {
                    window.clearTimeout(reconnectTimerRef.current);
                    reconnectTimerRef.current = null;
                }
                setConnectionLabel('Connected');
            }
            if (state === 'connecting') setConnectionLabel('Connecting');
            if (state === 'disconnected') scheduleNegotiationRetry();
            if (state === 'failed') {
                setConnectionLabel(iceConfigData?.data?.turnConfigured ? 'Retrying' : 'Network blocked');
                sendSignal({ type: 'renegotiate' });
                scheduleNegotiationRetry();
            }
            if (state === 'closed') setConnectionLabel('Waiting');
        };

        const localStream = localStreamRef.current;
        if (localStream) {
            localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
        }

        peerRef.current = peer;
        return peer;
    }, [iceConfigData?.data?.turnConfigured, iceServers, joinTelehealthSession, parsedAppointmentId, scheduleNegotiationRetry, sendSignal]);

    const makeOffer = useCallback(async () => {
        const peer = peerRef.current || createPeerConnection();
        if (peer.signalingState !== 'stable') return;
        setConnectionLabel('Connecting');
        isMakingOfferRef.current = true;
        try {
            const offer = await peer.createOffer({ iceRestart: peer.connectionState === 'failed' });
            await peer.setLocalDescription(offer);
            sendSignal({ type: 'offer', sdp: offer });
        } finally {
            isMakingOfferRef.current = false;
        }
    }, [createPeerConnection, sendSignal]);

    useEffect(() => {
        makeOfferRef.current = makeOffer;
    }, [makeOffer]);

    const maybeInitiateOfferFromParticipants = useCallback((participants?: SignalParticipant[]) => {
        if (!participants || participants.length < 2) return;

        participantsRef.current = participants;
        const shouldInitiate = getShouldInitiateOffer(participants, senderId);
        if (shouldInitiate) {
            void makeOffer();
        }
    }, [makeOffer, senderId]);

    useEffect(() => {
        if (!callStarted || !hasValidAppointmentId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
            reconnectDelay: 4000,
            debug: () => {},
        });

        client.onConnect = () => {
            stompRef.current = client;
            reconnectAttemptsRef.current = 0;
            client.subscribe(`/topic/telehealth/signal/${parsedAppointmentId}`, async (message: IMessage) => {
                const signal = JSON.parse(message.body) as SignalMessage;
                const isSelfSignal = signal.senderId === senderId;
                const participants = Array.isArray(signal.participants) ? signal.participants : [];
                if (participants.length > 0) {
                    participantsRef.current = participants;
                    const remote = participants.find((participant) => participant.senderId !== senderId);
                    if (remote?.senderName) {
                        setRemoteParticipant(remote.senderName);
                    } else if (!remote) {
                        setRemoteParticipant(null);
                    }
                }

                try {
                    if (signal.type === 'join') {
                        if (participants.length > 1) {
                            setConnectionLabel('Peer found');
                        } else {
                            setConnectionLabel('Waiting');
                            setRemoteConnected(false);
                        }
                        createPeerConnection();
                        maybeInitiateOfferFromParticipants(participants);
                        return;
                    }

                    if (isSelfSignal) return;
                    if (participants.length === 0 && signal.senderName) {
                        setRemoteParticipant(signal.senderName);
                    }

                    if (signal.type === 'offer' && signal.sdp) {
                        const peer = peerRef.current || createPeerConnection();
                        if (peer.signalingState !== 'stable') {
                            try {
                                await peer.setLocalDescription({ type: 'rollback' });
                            } catch {
                                return;
                            }
                        }

                        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                        const answer = await peer.createAnswer();
                        await peer.setLocalDescription(answer);
                        sendSignal({ type: 'answer', sdp: answer });
                        await flushPendingCandidates();
                    }

                    if (signal.type === 'answer' && signal.sdp && peerRef.current) {
                        await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                        await flushPendingCandidates();
                    }

                    if (signal.type === 'candidate' && signal.candidate) {
                        const peer = peerRef.current || createPeerConnection();
                        if (peer.remoteDescription) {
                            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
                        } else {
                            pendingCandidatesRef.current.push(signal.candidate);
                        }
                    }

                    if (signal.type === 'renegotiate') {
                        setConnectionLabel('Retrying');
                        maybeInitiateOfferFromParticipants(participantsRef.current);
                    }

                    if (signal.type === 'leave') {
                        if (participants.length < 2) {
                            setConnectionLabel('Waiting');
                            setRemoteConnected(false);
                            setRemoteParticipant(null);
                        }
                    }

                    if (signal.type === 'end') {
                        setTelehealthInCall(false);
                        cleanupCall();
                        setCallStarted(false);
                        setConnectionLabel('Waiting');
                    }
                } catch (signalError) {
                    console.warn('Telehealth signal skipped:', signalError);
                }
            });

            createPeerConnection();
            sendSignal({ type: 'join' });
            reconnectTimerRef.current = window.setTimeout(() => {
                maybeInitiateOfferFromParticipants(participantsRef.current);
            }, 900);
        };

        client.onWebSocketError = () => {
            setConnectionLabel('Retrying');
            scheduleNegotiationRetry();
        };
        client.activate();

        return () => {
            sendSignal({ type: 'leave' });
            client.deactivate();
        };
    }, [callStarted, cleanupCall, createPeerConnection, flushPendingCandidates, hasValidAppointmentId, maybeInitiateOfferFromParticipants, parsedAppointmentId, scheduleNegotiationRetry, sendSignal, senderId]);

    useEffect(() => cleanupCall, [cleanupCall]);

    useEffect(() => {
        stopIncomingRingtone();
    }, []);

    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
            void localVideoRef.current.play().catch(() => undefined);
        }
    }, [callStarted]);

    const enableAlerts = async (requestNotifications = true) => {
        const audioEnabled = await unlockTelehealthAudio();
        const notificationAlreadyAllowed = 'Notification' in window && Notification.permission === 'granted';
        setAlertsReady(audioEnabled || notificationAlreadyAllowed);

        if (!requestNotifications || notificationAlreadyAllowed) return audioEnabled || notificationAlreadyAllowed;

        const notificationEnabled = await Promise.race([
            requestTelehealthNotificationPermission(),
            new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), 900)),
        ]);
        setAlertsReady(audioEnabled || notificationEnabled);
        return audioEnabled || notificationEnabled;
    };

    const startCall = async () => {
        setIsStarting(true);
        setMediaError(null);
        stopIncomingRingtone();
        setTelehealthInCall(true);
        void enableAlerts(false);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            cameraVideoTrackRef.current = stream.getVideoTracks()[0] || null;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            await startTelehealthSession(parsedAppointmentId).unwrap();
            setCallStarted(true);
        } catch (startError) {
            setTelehealthInCall(false);
            const message = startError instanceof DOMException && startError.name === 'NotAllowedError'
                ? 'Camera or microphone permission was blocked. Please allow access and retry.'
                : 'Could not start the consultation. Please check camera, microphone, and network access.';
            setMediaError(message);
        } finally {
            setIsStarting(false);
        }
    };

    const toggleMic = () => {
        const next = !micEnabled;
        localStreamRef.current?.getAudioTracks().forEach((track) => {
            track.enabled = next;
        });
        setMicEnabled(next);
    };

    const toggleCamera = () => {
        const next = !cameraEnabled;
        localStreamRef.current?.getVideoTracks().forEach((track) => {
            track.enabled = next;
        });
        setCameraEnabled(next);
    };

    const replaceOutgoingVideoTrack = async (track: MediaStreamTrack | null) => {
        const sender = peerRef.current?.getSenders().find((item) => item.track?.kind === 'video');
        if (sender) {
            await sender.replaceTrack(track);
        }
    };

    const stopScreenShare = useCallback(async () => {
        screenStreamRef.current?.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
        await replaceOutgoingVideoTrack(cameraVideoTrackRef.current);
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
            void localVideoRef.current.play().catch(() => undefined);
        }
        setIsScreenSharing(false);
    }, []);

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            await stopScreenShare();
            return;
        }

        if (!navigator.mediaDevices?.getDisplayMedia) {
            setMediaError('Screen sharing is not supported in this browser.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            const [screenTrack] = stream.getVideoTracks();
            if (!screenTrack) return;
            screenStreamRef.current = stream;
            screenTrack.onended = () => {
                void stopScreenShare();
            };
            await replaceOutgoingVideoTrack(screenTrack);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                void localVideoRef.current.play().catch(() => undefined);
            }
            setIsScreenSharing(true);
            setMediaError(null);
        } catch (shareError) {
            if (!(shareError instanceof DOMException && shareError.name === 'NotAllowedError')) {
                setMediaError('Screen sharing could not start. Please try again.');
            }
        }
    };

    const copyRoomLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setMeetingCopied(true);
            window.setTimeout(() => setMeetingCopied(false), 1800);
        } catch {
            setMeetingCopied(false);
        }
    };

    if (!hasValidAppointmentId) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
                <VideoOff className="mb-4 h-16 w-16 text-amber-400" />
                <h1 className="mb-2 text-2xl font-bold">Appointment Required</h1>
                <p className="max-w-md text-slate-400">Open Telehealth from a scheduled appointment so we can connect you to the correct room.</p>
                <button onClick={() => navigate('/telehealth')} className="mt-6 rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white">
                    Telehealth Help
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-400" />
                <p className="text-lg font-semibold">Preparing secure consultation room</p>
            </div>
        );
    }

    if (error) {
        const copy = getTelehealthErrorCopy(error);
        const appointmentPath = user?.role === 'DOCTOR' ? '/doctor/appointments' : user?.role === 'PATIENT' ? '/patient/appointments' : '/admin/appointments';

        return (
            <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
                <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
                    <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/30">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 px-8 py-10 text-center">
                            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-300 ring-1 ring-red-300/20">
                                <VideoOff className="h-10 w-10" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">Telehealth room</p>
                            <h1 className="mt-3 text-3xl font-black">{copy.title}</h1>
                            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">{copy.message}</p>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row">
                            <button onClick={() => window.location.reload()} className="flex-1 rounded-2xl bg-teal-600 px-5 py-3 font-black text-white shadow-lg shadow-teal-100 transition hover:bg-teal-700">
                                Retry room
                            </button>
                            <button onClick={() => navigate(appointmentPath)} className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50">
                                Open appointments
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!callStarted) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
                    <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
                        <section>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                                <ShieldCheck className="h-4 w-4" />
                                HMS ID-password protected room
                            </div>
                            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                                Private video consultation through your HMS account.
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                                This call runs inside MediCare HMS. Patients and doctors join after normal HMS login, then connect directly with camera, microphone, ringing alerts, and live status.
                            </p>
                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                {[
                                    { icon: Camera, label: 'Camera ready' },
                                    { icon: Mic, label: 'Audio ready' },
                                    { icon: BellRing, label: 'Ringtone alerts' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                        <Icon className="mb-3 h-5 w-5 text-teal-300" />
                                        <p className="text-sm font-semibold">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <aside className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-teal-950/40">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Appointment #{appointmentId}</p>
                                    <h2 className="mt-1 text-2xl font-black">Ready to connect</h2>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                                    <Video className="h-6 w-6" />
                                </div>
                            </div>

                            {(sessionData?.data?.doctorName || sessionData?.data?.patientName) && (
                                <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Consultation</p>
                                        <p className="mt-2 text-sm font-bold text-slate-950">
                                            {sessionData?.data?.doctorName || 'Doctor'} with {sessionData?.data?.patientName || 'Patient'}
                                        </p>
                                    </div>
                                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                                        <Activity className="h-3.5 w-3.5" />
                                        {getSessionStatusLabel(sessionData?.data?.status)}
                                    </span>
                                </div>
                            )}

                            {mediaError && (
                                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                    {mediaError}
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={() => void enableAlerts()}
                                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${alertsReady ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50'}`}
                                >
                                    <span className="flex items-center gap-3">
                                        {alertsReady ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Bell className="h-5 w-5 text-teal-600" />}
                                        <span>
                                            <span className="block text-sm font-bold">{alertsReady ? 'Alerts enabled' : 'Enable call alerts'}</span>
                                            <span className="text-xs text-slate-500">Ringtone and desktop notification support</span>
                                        </span>
                                    </span>
                                </button>

                                <button
                                    onClick={startCall}
                                    disabled={isStarting}
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-600 px-5 py-4 text-base font-black text-white shadow-xl shadow-teal-200 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isStarting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PhoneCall className="h-5 w-5" />}
                                    {getRoleLabel(user?.role)}
                                </button>

                                <button onClick={() => navigate(-1)} className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                                    Back to dashboard
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-[#111827] text-white">
            <header className="flex min-h-[68px] items-center justify-between border-b border-white/10 bg-[#111827]/95 px-4 py-3 backdrop-blur md:px-6">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black">
                            <span className="h-2 w-2 rounded-full bg-white" />
                            LIVE
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                            Appointment #{appointmentId}
                        </span>
                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            connectionLabel === 'Connected'
                                ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30'
                                : connectionLabel === 'Network blocked'
                                    ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30'
                                    : 'bg-teal-500/15 text-teal-200 ring-1 ring-teal-400/30'
                        }`}>
                            {remoteParticipant ? `${connectionLabel}: ${remoteParticipant}` : connectionLabel}
                        </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                        {sessionData?.data?.doctorName || 'Doctor'} with {sessionData?.data?.patientName || 'Patient'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={copyRoomLink}
                        className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-slate-100 transition hover:bg-white/15 md:inline-flex"
                        title="Copy meeting link"
                    >
                        <Copy className="h-4 w-4" />
                        {meetingCopied ? 'Copied' : 'Copy link'}
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="rounded-full bg-red-500 p-3 text-white shadow-lg shadow-red-950/40 transition hover:bg-red-600"
                        title="End consultation"
                    >
                        <PhoneOff className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <main className="relative min-h-0 flex-1 overflow-hidden p-3 pb-28 md:p-5 md:pb-28">
                <section className="relative h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-2xl shadow-black/30">
                    <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full bg-black object-contain" />

                    {!remoteConnected && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#172033] px-6 text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-400/10 text-teal-300 ring-1 ring-teal-300/25">
                                <MonitorUp className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black md:text-3xl">
                                {connectionLabel === 'Network blocked' ? 'Network is blocking direct video' : 'Waiting for the other participant'}
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                                {connectionLabel === 'Network blocked'
                                    ? 'Both users are online, but this network needs a TURN relay. Add TURN env vars on Railway for strict mobile networks.'
                                    : 'Keep this room open. The consultation connects automatically when both sides are online.'}
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold text-slate-300">
                                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">HMS secure room</span>
                                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">{sessionData?.data?.roomName}</span>
                            </div>
                        </div>
                    )}

                    <div className="absolute right-3 top-3 w-[42vw] max-w-[280px] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl md:right-5 md:top-5 md:w-72">
                        <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
                        <div className="flex items-center justify-between bg-slate-950/95 px-3 py-2">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-200">You</p>
                                <p className="truncate text-sm font-bold">{user?.fullName || user?.username || 'HMS User'}</p>
                            </div>
                            {isScreenSharing && (
                                <span className="rounded-full bg-teal-400/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-teal-100">
                                    Sharing
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 hidden rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur md:block">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-teal-300" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Participants</p>
                                <p className="text-sm font-bold">{remoteParticipant ? `2 online` : `1 online`}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 z-[10001] border-t border-white/10 bg-[#111827]/95 px-3 py-3 backdrop-blur md:px-6">
                <div className="mx-auto flex max-w-5xl items-center justify-center gap-3">
                    <button
                        onClick={toggleMic}
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition md:h-14 md:w-14 ${
                            micEnabled ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={toggleCamera}
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition md:h-14 md:w-14 ${
                            cameraEnabled ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={toggleScreenShare}
                        className={`hidden h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition sm:flex md:h-14 ${
                            isScreenSharing ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-white text-slate-950 hover:bg-slate-200'
                        }`}
                        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                    >
                        <MonitorUp className="h-5 w-5" />
                        {isScreenSharing ? 'Stop sharing' : 'Present'}
                    </button>
                    <button
                        onClick={copyRoomLink}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 transition hover:bg-slate-200 md:hidden"
                        title="Copy meeting link"
                    >
                        <Copy className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="flex h-12 items-center justify-center gap-2 rounded-full bg-red-500 px-6 text-sm font-black text-white shadow-xl shadow-red-950/40 transition hover:bg-red-600 md:h-14 md:px-8"
                        title="End consultation"
                    >
                        <PhoneOff className="h-5 w-5" />
                        <span className="hidden sm:inline">End</span>
                    </button>
                </div>
                {mediaError && (
                    <p className="mx-auto mt-2 max-w-3xl text-center text-xs font-semibold text-amber-200">{mediaError}</p>
                )}
            </footer>
        </div>
    );
};

export default VideoCall;
