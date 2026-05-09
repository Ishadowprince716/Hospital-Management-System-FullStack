import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import api from '../../api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

const AIAgent: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
                content: `Hello ${user?.fullName || 'there'}! I'm your AI Medical Assistant. How can I help you today?`,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg: Message = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        setHistory(prev => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                message: message,
                role: user?.role || 'PATIENT',
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
        } catch (error) {
            console.error('AI Chat Error:', error);
            setHistory(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting to my brain right now. Please try again later.",
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-all z-50 animate-bounce-slow"
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-800 z-50 animate-slideIn">
                    {/* Header */}
                    <div className="p-4 border-b dark:border-slate-800 bg-teal-600 text-white rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-bold">MediMate AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-teal-500 p-1 rounded-lg transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {history.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-teal-600 text-white rounded-tr-none' 
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                } shadow-sm`}>
                                    {msg.content}
                                    <div className={`text-[10px] mt-1 opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your health query..."
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
                        />
                        <button 
                            type="submit"
                            disabled={!message.trim() || loading}
                            className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                    
                    {/* Footer */}
                    <div className="px-4 pb-4 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                        <Sparkles className="h-3 w-3" /> Powered by MediMate Health AI
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAgent;
