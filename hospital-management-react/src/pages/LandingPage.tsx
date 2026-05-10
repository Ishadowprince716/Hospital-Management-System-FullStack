import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Bot, Video, Shield,
    ArrowRight, CheckCircle,
    Smartphone, Zap, Globe
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
            {/* ─── Navigation ─── */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight dark:text-white">MediCare <span className="text-teal-600">HMS</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
                        <a href="#ai" className="hover:text-teal-600 transition-colors">AI Health</a>
                        <a href="#telehealth" className="hover:text-teal-600 transition-colors">Telehealth</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-teal-600 transition-all">Login</button>
                        <button onClick={() => navigate('/register')} className="px-6 py-2.5 text-sm font-bold bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="pt-40 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 animate-fadeIn">
                        <Sparkles className="h-4 w-4" /> Next-Gen Healthcare Platform
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-tight">
                        Healthcare Redefined for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Modern Digital Age</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Seamlessly managing appointments, electronic health records, and AI-driven diagnostics in one unified, cloud-native ecosystem.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 text-lg group">
                            Book an Appointment <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-gray-200 hover:border-teal-300 transition-all text-lg">
                            Watch Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 py-10 border-y border-gray-100 dark:border-slate-900">
                        {[
                            { label: 'Active Doctors', value: '150+' },
                            { label: 'Happy Patients', value: '12k+' },
                            { label: 'AI Accuracy', value: '98.5%' },
                            { label: 'Uptime', value: '99.9%' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section id="features" className="py-20 px-4 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Powerful Features for Modern Clinics</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Everything you need to manage your health or your practice.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Bot,
                                title: 'AI Clinical Triage',
                                desc: 'Our advanced Gemini AI analyzes your symptoms and suggests the right path forward with clinical accuracy.',
                                color: 'bg-blue-600'
                            },
                            {
                                icon: Video,
                                title: 'Integrated Telehealth',
                                desc: 'HD video consultations built directly into your dashboard. Secure, private, and seamless.',
                                color: 'bg-purple-600'
                            },
                            {
                                icon: Shield,
                                title: 'Encrypted Records',
                                desc: 'Your medical data is protected with military-grade encryption and compliant with global health standards.',
                                color: 'bg-emerald-600'
                            },
                            {
                                icon: Zap,
                                title: 'Real-time Alerts',
                                desc: 'Get instant notifications for appointment updates, lab results, and medication reminders.',
                                color: 'bg-amber-600'
                            },
                            {
                                icon: Smartphone,
                                title: 'Mobile First',
                                desc: 'A fully responsive experience designed for smartphones. Manage your health on the go.',
                                color: 'bg-rose-600'
                            },
                            {
                                icon: Globe,
                                title: 'Smart Scheduling',
                                desc: 'Intelligent booking system that minimizes wait times and optimizes doctor availability.',
                                color: 'bg-teal-600'
                            }
                        ].map((feat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 hover:shadow-2xl transition-all group">
                                <div className={`w-14 h-14 rounded-2xl ${feat.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:-translate-y-2 transition-transform`}>
                                    <feat.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm font-medium">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── AI Showcase ─── */}
            <section id="ai" className="py-24 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-teal-500/20 rounded-[40px] blur-3xl" />
                        <div className="relative bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl">
                            <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MediMate AI Interface</span>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-end">
                                    <div className="bg-teal-600 text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-lg">
                                        "I have a persistent cough and mild fever. What should I do?"
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 text-gray-200 p-4 rounded-2xl rounded-tl-none text-sm max-w-[80%] border border-slate-700">
                                        <div className="flex items-center gap-2 text-teal-400 font-bold text-[10px] uppercase mb-2">
                                            <Bot className="h-3 w-3" /> AI ASSESSMENT
                                        </div>
                                        Based on your symptoms, I recommend seeing a **General Physician**. Your urgency level is **MEDIUM**. Would you like me to book a slot?
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                            Gemini Pro Powered
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                            Integrated Intelligence in <br /> Every Interaction
                        </h2>
                        <ul className="space-y-4">
                            {[
                                'Clinical symptom triage & assessment',
                                'Automated health journey summaries',
                                'Strategic operational insights for admins',
                                'Smart medication conflict detection'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 shrink-0">
                                        <CheckCircle className="h-3 w-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="py-20 px-4 border-t border-gray-100 dark:border-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Activity className="h-6 w-6 text-teal-600" />
                        <span className="text-xl font-bold tracking-tight dark:text-white">MediCare HMS</span>
                    </div>
                    <p className="text-sm text-gray-400">© 2026 MediCare Health Systems. Built for the modern age.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-teal-600 transition-colors"><Smartphone className="h-5 w-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-teal-600 transition-colors"><Globe className="h-5 w-5" /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
);

export default LandingPage;
