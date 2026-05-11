import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Bot, Video, Shield,
    ArrowRight, CheckCircle,
    Smartphone, Zap, Globe, Stethoscope,
    Github, Linkedin, Instagram, Facebook, Mail, MessageCircle, Code2, Palette,
    CalendarCheck, FileText, CreditCard, Users, LockKeyhole
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
        <div className="min-h-screen bg-white text-slate-950 transition-colors dark:bg-slate-950">
            {/* ─── Navigation ─── */}
            <nav className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="block text-lg font-black tracking-tight dark:text-white">MediCare <span className="text-teal-600">HMS</span></span>
                            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">Hospital OS</span>
                        </div>
                    </button>

                    <div className="hidden items-center gap-7 text-sm font-bold text-slate-600 dark:text-slate-300 lg:flex">
                        <a href="#features" className="transition-colors hover:text-teal-600">Features</a>
                        <a href="#ai" className="transition-colors hover:text-teal-600">AI Health</a>
                        <a href="#telehealth" className="transition-colors hover:text-teal-600">Telehealth</a>
                        <a href="#developer" className="transition-colors hover:text-teal-600">Developer</a>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={() => navigate('/login')} className="hidden rounded-xl px-4 py-2.5 text-sm font-black text-slate-700 transition-all hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-900 sm:inline-flex">Login</button>
                        <button onClick={() => navigate('/register')} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700 active:scale-95 sm:px-6">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="relative overflow-hidden px-4 pb-14 pt-32 sm:px-6 lg:pb-20 lg:pt-36">
                <div className="absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(circle_at_12%_18%,rgba(20,184,166,0.18),transparent_30rem),radial-gradient(circle_at_88%_10%,rgba(37,99,235,0.16),transparent_28rem)]" />
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[0.94fr_1.06fr]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-teal-700 shadow-sm backdrop-blur dark:border-teal-900/70 dark:bg-teal-950/20 dark:text-teal-300">
                            <Sparkles className="h-4 w-4" /> Next-Gen Healthcare Platform
                        </div>
                        <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-slate-950 dark:text-white md:text-7xl">
                            MediCare HMS for smarter hospitals and calmer patients
                        </h1>
                        <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
                            Manage appointments, records, billing, doctors, patients, AI guidance, and telehealth inside one polished hospital operating system.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button onClick={() => navigate('/register')} className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 text-base font-black text-white shadow-xl shadow-teal-600/25 transition-all hover:bg-teal-700 active:scale-[0.99]">
                                Start Using HMS <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button onClick={() => navigate('/login')} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 text-base font-black text-slate-700 shadow-sm transition-all hover:border-teal-300 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                                Login to Dashboard
                            </button>
                        </div>

                        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                { icon: LockKeyhole, label: 'Secure records' },
                                { icon: Video, label: 'Telehealth ready' },
                                { icon: Bot, label: 'AI assisted care' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                                    <item.icon className="h-4 w-4 text-teal-600" />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-[32px] border border-slate-200 bg-white/90 p-4 shadow-2xl shadow-slate-900/12 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                                    <div>
                                        <p className="text-sm font-black text-slate-950 dark:text-white">Today’s Operations</p>
                                        <p className="text-xs font-semibold text-slate-500">Live clinical workspace</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Online</span>
                                </div>

                                <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Appointments', value: '42', icon: CalendarCheck, tone: 'bg-blue-50 text-blue-600' },
                                            { label: 'Patients', value: '1,248', icon: Users, tone: 'bg-teal-50 text-teal-600' },
                                            { label: 'Revenue', value: '₹84k', icon: CreditCard, tone: 'bg-amber-50 text-amber-600' },
                                        ].map((stat) => (
                                            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                                                        <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{stat.value}</p>
                                                    </div>
                                                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${stat.tone}`}>
                                                        <stat.icon className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                        <div className="mb-4 flex items-center justify-between">
                                            <p className="text-sm font-black text-slate-950 dark:text-white">Care Timeline</p>
                                            <FileText className="h-5 w-5 text-slate-400" />
                                        </div>
                                        {[
                                            ['09:30', 'Cardiology consultation', 'Confirmed'],
                                            ['11:15', 'Lab report review', 'Pending'],
                                            ['14:00', 'Video follow-up', 'Ready'],
                                            ['16:30', 'Billing reconciliation', 'Paid'],
                                        ].map(([time, title, status]) => (
                                            <div key={title} className="flex items-start gap-3 border-t border-slate-100 py-3 first:border-t-0 first:pt-0 dark:border-slate-800">
                                                <span className="w-12 shrink-0 text-xs font-black text-slate-400">{time}</span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{title}</p>
                                                    <p className="text-xs font-semibold text-teal-600">{status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-8 dark:border-slate-800 md:grid-cols-4">
                            {[
                                { label: 'Active Doctors', value: '150+' },
                                { label: 'Happy Patients', value: '12k+' },
                                { label: 'AI Accuracy', value: '98.5%' },
                                { label: 'Uptime', value: '99.9%' }
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl font-black text-slate-950 dark:text-white">{stat.value}</div>
                                    <div className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
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
            <footer id="developer" className="relative overflow-hidden border-t border-slate-200 bg-slate-950 px-4 py-16 text-white dark:border-slate-900">
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
