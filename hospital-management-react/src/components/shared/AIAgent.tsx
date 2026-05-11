import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Sparkles, Activity, AlertTriangle, ArrowRight, Mic, MicOff } from 'lucide-react';
import api from '../../api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    type?: 'text' | 'triage';
    metadata?: TriageMetadata;
}

interface TriageMetadata {
    recommendedSpecialization?: string;
    urgencyLevel?: string;
    analysisSummary?: string;
}

interface SpeechRecognitionResultEventLike {
    results: {
        0: {
            0: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognitionErrorEventLike {
    error: string;
}

interface SpeechRecognitionLike {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const buildLocalSupportMessage = (role?: string) => {
    if (role?.toUpperCase() === 'DOCTOR') {
        return "MediMate is running in local clinical support mode right now. Gemini is unavailable, but I can still help structure a quick clinical note, symptom summary, assessment checklist, or HMS workflow. Share the patient's age, complaint, duration, vitals, history, medicines, allergies, and any red flags.";
    }

    return "MediMate is running in local support mode right now. I can still help with general health guidance and HMS portal questions. For symptoms, share when they started, severity, age, existing conditions, medicines, and any warning signs. For urgent symptoms, contact emergency care.";
};

const MediMateCharacter = ({
    size = 'sm',
    variant = 'avatar',
    className = ''
}: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'avatar' | 'full';
    className?: string;
}) => {
    const sizeClass = {
        xs: 'h-9 w-9',
        sm: 'h-11 w-11',
        md: 'h-[54px] w-[54px]',
        lg: 'h-[66px] w-[66px]',
        xl: 'h-[92px] w-[92px]',
    }[size];
    if (variant === 'avatar') {
        return (
            <svg
                aria-hidden="true"
                viewBox="0 0 128 128"
                className={`${sizeClass} ${className}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="64" cy="64" r="60" fill="#ECFEFF" />
                <circle cx="64" cy="64" r="58" stroke="#99F6E4" strokeWidth="3" />
                <path d="M38 111C41 90 50 80 65 80C80 80 89 90 92 111H38Z" fill="#0F766E" />
                <path d="M51 86L64 105L78 86" stroke="#99F6E4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M55 74H73L70 88H58L55 74Z" fill="#F4B38B" />

                <path d="M39 46C39 25 54 15 70 17C88 19 96 37 87 56H43C39 53 38 50 39 46Z" fill="#5C2B17" />
                <path d="M45 50C45 31 58 23 73 26C83 28 88 37 87 51V61C87 76 77 88 64 88C52 88 45 77 45 63V50Z" fill="#F3B58E" />
                <path d="M43 51C50 46 54 39 56 30C62 38 72 42 88 40" stroke="#3F1F12" strokeWidth="5" strokeLinecap="round" />
                <path d="M42 58C35 55 33 61 36 67C39 72 44 70 45 65" fill="#F3B58E" />
                <path d="M88 58C95 55 97 61 94 67C91 72 86 70 85 65" fill="#F3B58E" />

                <path d="M54 56C57 59 62 59 65 56" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M70 56C73 59 78 59 81 56" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="59.5" cy="56" r="9" stroke="#334155" strokeWidth="3" />
                <circle cx="75.5" cy="56" r="9" stroke="#334155" strokeWidth="3" />
                <path d="M68 56H67" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                <path d="M58 73C62 77 69 77 73 73" stroke="#8A4B2A" strokeWidth="3" strokeLinecap="round" />
                <path d="M66 90V101" stroke="#CCFBF1" strokeWidth="3" strokeLinecap="round" />
                <circle cx="66" cy="106" r="6" fill="#E6FFFB" stroke="#0D9488" strokeWidth="2.5" />
                <path d="M66 102V110M62 106H70" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
                <path d="M55 22C61 14 73 13 82 20" stroke="#8B4A25" strokeWidth="5" strokeLinecap="round" />
            </svg>
        );
    }

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 128 128"
            className={`${sizeClass} ${className}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="64" cy="64" r="60" fill="#ECFEFF" />
            <circle cx="64" cy="64" r="58" stroke="#99F6E4" strokeWidth="3" />
            <ellipse cx="64" cy="111" rx="38" ry="7" fill="#0F766E" opacity="0.12" />

            <path d="M50 29C52 18 66 12 78 18C88 23 88 37 82 46H49C43 39 44 32 50 29Z" fill="#6B351B" />
            <path d="M48 36C48 25 56 18 68 18C78 18 84 25 84 36V47C84 58 76 66 66 66H63C54 66 48 58 48 48V36Z" fill="#F3B58E" />
            <path d="M47 39C51 36 55 31 56 25C61 31 69 34 84 32" stroke="#4B2414" strokeWidth="4" strokeLinecap="round" />
            <path d="M47 45C42 43 40 47 42 51C44 55 48 54 49 51" fill="#F3B58E" />
            <path d="M85 45C90 43 92 47 90 51C88 55 84 54 83 51" fill="#F3B58E" />

            <circle cx="57" cy="43" r="7" stroke="#334155" strokeWidth="2.5" />
            <circle cx="74" cy="43" r="7" stroke="#334155" strokeWidth="2.5" />
            <path d="M64 43H67" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M54 42C56 44 59 44 61 42" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M71 42C73 44 76 44 78 42" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M60 53C63 56 68 56 71 53" stroke="#8A4B2A" strokeWidth="2.5" strokeLinecap="round" />

            <path d="M60 64H70L68 73H62L60 64Z" fill="#F3B58E" />
            <path d="M45 76C48 66 56 63 65 63C75 63 83 67 86 76L90 95H40L45 76Z" fill="#0F766E" />
            <path d="M54 65L64 82L75 65" stroke="#99F6E4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="64" cy="84" r="5" fill="#E6FFFB" stroke="#0D9488" strokeWidth="2" />
            <path d="M64 81V87M61 84H67" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round" />

            <path d="M45 77C32 81 28 89 31 96C35 103 46 95 48 87" stroke="#F3B58E" strokeWidth="8" strokeLinecap="round" />
            <path d="M85 77C98 81 102 89 99 96C95 103 84 95 82 87" stroke="#F3B58E" strokeWidth="8" strokeLinecap="round" />
            <circle cx="30" cy="98" r="4.5" fill="#F3B58E" />
            <circle cx="100" cy="98" r="4.5" fill="#F3B58E" />
            <path d="M28 95C25 92 26 88 30 88" stroke="#0F766E" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M102 95C105 92 104 88 100 88" stroke="#0F766E" strokeWidth="2.4" strokeLinecap="round" />

            <path d="M43 94C32 92 22 96 18 104C32 107 47 106 61 99" fill="#7C4A2A" />
            <path d="M85 94C96 92 106 96 110 104C96 107 81 106 67 99" fill="#7C4A2A" />
            <path d="M32 107C43 105 55 102 64 96C74 102 86 105 96 107" stroke="#4B2414" strokeWidth="5" strokeLinecap="round" />
            <path d="M55 19C61 12 73 12 81 18" stroke="#8B4A25" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
};

const AIAgent: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [mode, setMode] = useState<'chat' | 'triage'>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const panelFont = "'DM Sans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    // Speech Recognition Setup
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

    useEffect(() => {
        const browserWindow = window as SpeechRecognitionWindow;
        const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setMessage(transcript);
                setIsListening(false);
                toast.success('Voice captured!');
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
                setIsListening(false);
                toast.error('Voice recognition failed. Please try typing.');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setMessage('');
            recognitionRef.current.start();
            setIsListening(true);
            toast('Listening...');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [history, isOpen]);

    useEffect(() => {
        // Initial welcome message
        if (history.length === 0) {
            setHistory([{
                role: 'assistant',
                content: `Hello ${user?.fullName || 'there'}! I'm MediMate, your friendly medical assistant. How can I help you today?`,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [history.length, user?.fullName]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg: Message = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        setHistory(prev => [...prev, userMsg]);
        const currentMessage = message;
        setMessage('');
        setLoading(true);

        try {
            if (mode === 'triage') {
                const res = await api.post('/ai/triage', { symptoms: currentMessage });
                const triageData = res.data?.data as TriageMetadata | undefined;

                const aiMsg: Message = {
                    role: 'assistant',
                    type: 'triage',
                    content: triageData?.analysisSummary || 'Triage analysis is unavailable right now.',
                    metadata: triageData,
                    timestamp: new Date().toISOString()
                };
                setHistory(prev => [...prev, aiMsg]);
                setMode('chat'); // Reset after triage
            } else {
                const res = await api.post('/ai/chat', {
                    message: currentMessage,
                    role: user?.role || 'PATIENT',
                    userId: user?.id,
                    clientTime: new Date().toISOString(),
                    clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    conversationHistory: history.slice(-5).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                });

                const aiMsg: Message = {
                    role: 'assistant',
                    content: res.data?.data?.message || 'I encountered an error processing your request.',
                    timestamp: new Date().toISOString()
                };

                setHistory(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error('AI Error:', error);
            setHistory(prev => [...prev, {
                role: 'assistant',
                content: buildLocalSupportMessage(user?.role),
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const startTriage = () => {
        setMode('triage');
        setHistory(prev => [...prev, {
            role: 'assistant',
            content: "Clinical triage mode is active. Describe your symptoms with duration, severity, and any warning signs.",
            timestamp: new Date().toISOString()
        }]);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    aria-label="Open MediMate AI"
                    title="Open MediMate AI"
                    className="fixed bottom-5 right-5 z-50 grid h-[72px] w-[72px] place-items-center rounded-2xl bg-white text-teal-700 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:bg-slate-950 dark:text-teal-300"
                >
                    <MediMateCharacter size="lg" variant="full" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{ fontFamily: panelFont }}
                    className="fixed bottom-4 right-4 z-50 flex h-[min(640px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/20 animate-slideIn dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:bottom-6 sm:right-6"
                >
                    {/* Header */}
                    <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg">
                                    <MediMateCharacter size="md" variant="avatar" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block truncate text-[15px] font-semibold leading-tight text-slate-950 dark:text-white">MediMate AI</span>
                                    <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        <span className={`h-1.5 w-1.5 rounded-full ${mode === 'triage' ? 'bg-amber-500' : 'bg-teal-500'}`} />
                                        {mode === 'triage' ? 'Clinical triage' : 'Friendly medical assistant'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                {user?.role === 'PATIENT' && mode === 'chat' && (
                                    <button
                                        onClick={startTriage}
                                        title="Start symptom checker"
                                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:text-slate-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
                                    >
                                        <Activity className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close MediMate AI"
                                    className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                >
                                    <X className="h-[18px] w-[18px]" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4 scrollbar-hide dark:bg-slate-950/70 sm:px-4">
                        {history.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && i !== 0 && (
                                    <div className="mr-2 mt-1 grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md">
                                        <MediMateCharacter size="xs" variant="avatar" />
                                    </div>
                                )}
                                <div className={`max-w-[86%] rounded-md px-3.5 py-3 text-[14px] leading-6 shadow-sm ${
                                    msg.role === 'user'
                                    ? 'bg-teal-700 text-white shadow-teal-900/10'
                                    : i === 0
                                        ? 'bg-gradient-to-br from-white to-teal-50/70 text-slate-800 dark:from-slate-900 dark:to-teal-950/20 dark:text-slate-100'
                                        : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                                }`}>
                                    {msg.type === 'triage' ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-300">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Triage Assessment
                                            </div>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>

                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
                                                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">Specialization</span>
                                                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">{msg.metadata?.recommendedSpecialization || 'General Practice'}</span>
                                                </div>
                                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
                                                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">Urgency</span>
                                                    <span className={`text-xs font-bold ${
                                                        msg.metadata?.urgencyLevel === 'HIGH' || msg.metadata?.urgencyLevel === 'EMERGENCY'
                                                        ? 'text-red-500' : 'text-orange-500'
                                                    }`}>
                                                        {msg.metadata?.urgencyLevel || 'MEDIUM'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate('/patient/book-appointment')}
                                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            >
                                                Book Appointment <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : msg.role === 'assistant' && i === 0 ? (
                                        <div className="flex items-start gap-3">
                                            <div className="grid h-[96px] w-[96px] shrink-0 place-items-center overflow-hidden rounded-lg">
                                                <MediMateCharacter size="xl" variant="full" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="mb-1 text-xs font-semibold text-teal-700 dark:text-teal-300">MediMate AI</div>
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    )}
                                    <div className={`mt-2 text-[11px] ${msg.role === 'user' ? 'text-right text-teal-50/75' : 'text-left text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                    <Loader2 className="h-4 w-4 animate-spin text-teal-700 dark:text-teal-300" />
                                    Thinking
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Mode Indicator */}
                    {mode === 'triage' && (
                        <div className="flex items-center gap-2 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                            <AlertTriangle className="h-3.5 w-3.5" /> Symptom checker active
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                        <button
                            type="button"
                            onClick={toggleListening}
                            title={isListening ? 'Stop listening' : 'Voice input'}
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border transition-colors ${
                                isListening
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-800 dark:hover:bg-teal-950/30 dark:hover:text-teal-300'
                            }`}
                        >
                            {isListening ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
                        </button>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={mode === 'triage' ? "Describe your symptoms..." : "Type your health query..."}
                            className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-900"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || loading}
                            title="Send"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-teal-700 text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
                        >
                            <Send className="h-[18px] w-[18px]" />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="border-t border-slate-100 bg-white px-4 py-2 text-center text-[11px] font-medium text-slate-400 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-500">
                        For urgent symptoms, contact emergency care.
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAgent;
