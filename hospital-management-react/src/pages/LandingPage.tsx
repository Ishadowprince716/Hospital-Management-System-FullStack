import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Bot, Video, Shield,
    ArrowRight, CheckCircle,
    Smartphone, Zap, Globe, Stethoscope,
    Github, Linkedin, Instagram, Facebook, Mail, MessageCircle, Code2, Palette
} from 'lucide-react';

const developerLinks = [
    {
        label: 'GitHub',
        href: 'https://github.com/Ishadowprince716',
        icon: Github,
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/rahul-singh-kushwah-233b36283',
        icon: Linkedin,
    },
    {
        label: 'GeeksforGeeks',
        href: 'https://www.geeksforgeeks.org/profile/patelmrrahul',
        icon: Code2,
    },
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/rahulsingh482004?igsh=MTRubnZrZjVpZ3RqYg==',
        icon: Instagram,
    },
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/share/1BS3ohzYZz/',
        icon: Facebook,
    },
];

const contactLinks = [
    {
        label: 'Gmail',
        value: 'patelmrrahul199@gmail.com',
        href: 'mailto:patelmrrahul199@gmail.com',
        icon: Mail,
    },
    {
        label: 'WhatsApp',
        value: '+91 75819 82880',
        href: 'https://wa.me/917581982880',
        icon: MessageCircle,
    },
];

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

            {/* ─── Telehealth ─── */}
            <section id="telehealth" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-300">
                            <Video className="h-4 w-4" /> Secure Virtual Clinic
                        </div>
                        <h2 className="mt-6 text-4xl font-black leading-tight text-slate-950 dark:text-white">
                            Start video consultations directly from appointments
                        </h2>
                        <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600 dark:text-slate-400">
                            Telehealth sessions are created for scheduled appointments, so patients and doctors join the same secure room with the right context.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-[0.99]">
                                Open My Appointments <ArrowRight className="h-4 w-4" />
                            </button>
                            <button onClick={() => navigate('/register')} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-teal-300 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                                Create Account
                            </button>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
                        <div className="aspect-video overflow-hidden rounded-3xl bg-slate-950">
                            <div className="grid h-full grid-cols-2 gap-1 p-1">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600">
                                    <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">Doctor</div>
                                    <Stethoscope className="absolute bottom-8 left-1/2 h-20 w-20 -translate-x-1/2 text-white/80" />
                                </div>
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
                                    <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">Patient</div>
                                    <Smartphone className="absolute bottom-8 left-1/2 h-20 w-20 -translate-x-1/2 text-white/80" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {['HD Video', 'Private Room', 'Appointment Linked'].map((item) => (
                                <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-center text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 px-4 py-16 text-white dark:border-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_32rem),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_28rem)]" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500 text-white shadow-xl shadow-teal-500/20">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xl font-black tracking-tight">MediCare HMS</p>
                                    <p className="text-sm font-semibold text-slate-400">Hospital Management System</p>
                                </div>
                            </div>

                            <div className="mt-8 max-w-2xl rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <img
                                        src="/rahul.jpg"
                                        alt="Rahul Singh Kushwah"
                                        className="h-20 w-20 rounded-2xl border-2 border-white/20 object-cover shadow-xl"
                                    />
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-300">Designed & Developed by</p>
                                        <h3 className="mt-2 text-2xl font-black tracking-tight">Rahul Singh Kushwah</h3>
                                        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-300">
                                            <span className="inline-flex items-center gap-1.5"><Code2 className="h-4 w-4 text-teal-300" /> Full Stack Developer</span>
                                            <span className="hidden text-slate-600 sm:inline">/</span>
                                            <span className="inline-flex items-center gap-1.5"><Palette className="h-4 w-4 text-blue-300" /> UI/UX Designer</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                                    Building clean, scalable, and user-focused digital products with polished interfaces, reliable engineering, and thoughtful healthcare workflows.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 content-start">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {contactLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target={link.href.startsWith('http') ? '_blank' : undefined}
                                        rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                                        className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-all hover:-translate-y-0.5 hover:border-teal-300/40 hover:bg-white/[0.1]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400/10 text-teal-300">
                                                <link.icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{link.label}</p>
                                                <p className="truncate text-sm font-bold text-slate-100 group-hover:text-teal-200">{link.value}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>

                            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Connect</p>
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {developerLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 text-sm font-bold text-slate-300 transition-all hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-teal-400/10 hover:text-white"
                                        >
                                            <link.icon className="h-4 w-4 text-teal-300 transition-transform group-hover:scale-110" />
                                            <span className="truncate">{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>© 2026 MediCare HMS. All rights reserved.</p>
                        <p className="font-semibold text-slate-400">Crafted with professional full-stack engineering and UI/UX design.</p>
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
