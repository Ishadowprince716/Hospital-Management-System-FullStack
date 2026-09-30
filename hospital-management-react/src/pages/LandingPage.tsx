import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Bot, Video, Shield,
    ArrowRight, CheckCircle,
    Smartphone, Zap, Stethoscope,
    Github, Linkedin, Instagram, Facebook, Mail, MessageCircle, Code2, Palette,
    ChevronRight, Sparkles, Cpu, Clock
} from 'lucide-react';
import { ConstellationField, ConnectivityGraph, ParticleNetwork } from '@designcodeio/threeui';
import { WireframeGlobe } from '../components/ui/WireframeGlobe';

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
        <div className="landing-page min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
            {/* ─── Navigation ─── */}
            <nav className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
                    <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-left">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 text-white shadow-xl shadow-teal-600/25 transition-transform group-hover:scale-105">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="font-display block text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                                MediCare <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-cyan-400">HMS</span>
                            </span>
                            <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 sm:block">
                                Hospital Operating System
                            </span>
                        </div>
                    </button>

                    <div className="hidden items-center gap-8 text-[14px] font-bold text-slate-600 dark:text-slate-300 lg:flex">
                        <a href="#features" className="transition-colors hover:text-teal-600 dark:hover:text-teal-400">Features</a>
                        <a href="#ai" className="transition-colors hover:text-teal-600 dark:hover:text-teal-400">AI Intelligence</a>
                        <a href="#telehealth" className="transition-colors hover:text-teal-600 dark:hover:text-teal-400">Virtual Clinic</a>
                        <a href="#developer" className="transition-colors hover:text-teal-600 dark:hover:text-teal-400">Developer</a>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-900 sm:inline-flex"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-teal-600/25 transition-all hover:-translate-y-0.5 hover:bg-teal-700 active:scale-95 sm:px-6"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section with Interactive 3D Wireframe Globe & Live Telemetry ─── */}
            <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 lg:pb-24 lg:pt-36">
                {/* 3D WebGL ThreeUI Ambient Field */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-40 dark:opacity-50">
                    <ConstellationField mode="auto" speed={0.6} density={0.65} />
                </div>
                
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            {/* Pill Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/80 px-4 py-1.5 text-xs font-bold text-teal-800 shadow-sm backdrop-blur dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300">
                                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                                <span className="uppercase tracking-widest text-[11px]">Next-Gen Clinical Architecture</span>
                            </div>

                            {/* Headline */}
                            <h1 className="font-display mt-6 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl leading-[1.08]">
                                The operating system for <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400">modern medicine</span> and patient trust
                            </h1>

                            {/* Subtitle */}
                            <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                                Orchestrate doctor scheduling, clinical records, automated billing, Gemini AI symptom triage, and end-to-end encrypted telehealth on one unified, high-performance platform.
                            </p>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="group inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-extrabold text-white shadow-xl shadow-teal-600/25 transition-all hover:-translate-y-0.5 hover:bg-teal-700 active:scale-[0.99]"
                                >
                                    Launch Patient Portal
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-8 py-3.5 text-base font-bold text-slate-800 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
                                >
                                    Staff Login
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </button>
                            </div>

                            {/* Trust Metrics Pill Bar */}
                            <div className="mt-10 grid grid-cols-3 gap-3">
                                {[
                                    { icon: Shield, title: 'HIPAA & AES-256', sub: 'End-to-End Encrypted' },
                                    { icon: Bot, title: 'Gemini Pro Triage', sub: 'Clinical Accuracy' },
                                    { icon: Video, title: 'WebRTC Virtual', sub: 'Low Latency Calls' },
                                ].map((badge) => (
                                    <div key={badge.title} className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-teal-50 p-1.5 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                                                <badge.icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{badge.title}</p>
                                                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{badge.sub}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive 3D Dotted Wireframe Globe + Floating Telemetry Hub */}
                        <div className="relative">
                            {/* Ambient Glow */}
                            <div className="absolute -inset-6 -z-10 rounded-[48px] bg-gradient-to-tr from-teal-500/20 via-cyan-500/15 to-blue-500/20 blur-3xl" />
                            
                            <div className="relative overflow-hidden rounded-[32px] border border-slate-200/90 bg-white/80 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                                {/* Top Header */}
                                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="relative flex h-3 w-3">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                                            <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500" />
                                        </div>
                                        <div>
                                            <p className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">Global Clinical Sync</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Interactive 3D Medical Node Matrix</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-teal-50 px-3 py-1 font-mono-numbers text-xs font-extrabold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                                        99.98% UPTIME
                                    </span>
                                </div>

                                {/* 3D Wireframe Globe */}
                                <div className="relative h-[340px] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
                                    <WireframeGlobe size={340} className="w-full h-full" />
                                </div>

                                {/* Live Operational Telemetry Strip */}
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-950/60">
                                        <p className="font-mono-numbers text-xl font-extrabold text-teal-600 dark:text-teal-400">150+</p>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Active Doctors</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-950/60">
                                        <p className="font-mono-numbers text-xl font-extrabold text-blue-600 dark:text-blue-400">12,480</p>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Patients Served</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-950/60">
                                        <p className="font-mono-numbers text-xl font-extrabold text-emerald-600 dark:text-emerald-400">98.5%</p>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">AI Accuracy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Bento Grid Features Section ─── */}
            <section id="features" className="relative py-24 px-5 sm:px-8 border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300">
                            <Sparkles className="h-3.5 w-3.5" /> High-Density Healthcare Engine
                        </div>
                        <h2 className="font-display mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                            Engineered for Clinical Precision & Workflow Velocity
                        </h2>
                        <p className="mt-4 text-base font-medium text-slate-600 dark:text-slate-400">
                            Every module connects seamlessly — from appointment scheduling and role-based permissions to AI-assisted triage and telehealth.
                        </p>
                    </div>

                    {/* Dynamic Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bento Card 1: AI Clinical Triage (Col Span 2) */}
                        <div className="bento-card md:col-span-2 p-8 flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25">
                                    <Bot className="h-7 w-7" />
                                </div>
                                <span className="rounded-full bg-teal-50 dark:bg-teal-950/50 px-3 py-1 text-xs font-extrabold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50">
                                    Gemini 2.5 Flash Triage
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="font-heading text-2xl font-extrabold text-slate-950 dark:text-white">
                                    AI-Driven Clinical Triage & Urgency Stratification
                                </h3>
                                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
                                    Patients describe symptoms in natural language. Our clinical reasoning pipeline analyzes urgency, flags potential contraindications, and matches the correct department automatically.
                                </p>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 text-xs font-bold">
                                    Low Risk • Self Care
                                </span>
                                <span className="rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1 text-xs font-bold">
                                    Medium • General OPD
                                </span>
                                <span className="rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 px-3 py-1 text-xs font-bold">
                                    High • Immediate ER
                                </span>
                            </div>
                        </div>

                        {/* Bento Card 2: Military Grade Security (Col Span 1) */}
                        <div className="bento-card p-8 flex flex-col justify-between">
                            <div>
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                                    <Shield className="h-7 w-7" />
                                </div>
                                <h3 className="font-heading mt-6 text-xl font-extrabold text-slate-950 dark:text-white">
                                    Encrypted Health Records
                                </h3>
                                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    Zero-knowledge data isolation, JWT authentication, and strict role-based access for Admins, Doctors, and Patients.
                                </p>
                            </div>
                            <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 text-xs font-mono-numbers text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                <span>STANDARD</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">AES-256 / SHA-512</span>
                            </div>
                        </div>

                        {/* Bento Card 3: Real-Time Alerts (Col Span 1) */}
                        <div className="bento-card p-8 flex flex-col justify-between">
                            <div>
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <h3 className="font-heading mt-6 text-xl font-extrabold text-slate-950 dark:text-white">
                                    Real-Time Telemetry
                                </h3>
                                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    Live operational updates for appointment status, prescription availability, and doctor queue management.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                                <Clock className="h-4 w-4" /> Real-time WebSocket Dispatch
                            </div>
                        </div>

                        {/* Bento Card 4: Integrated Virtual Clinic (Col Span 2) */}
                        <div className="bento-card md:col-span-2 p-8 flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25">
                                    <Video className="h-7 w-7" />
                                </div>
                                <span className="rounded-full bg-purple-50 dark:bg-purple-950/50 px-3 py-1 text-xs font-extrabold text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
                                    WebRTC HD Audio/Video
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="font-heading text-2xl font-extrabold text-slate-950 dark:text-white">
                                    Integrated Virtual Consultation Suite
                                </h3>
                                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
                                    Launch private telemedicine appointments with one click right from the patient or doctor portal. Includes live screen sharing, secure chat, and immediate post-call prescription drafting.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Consultation Rooms Ready</span>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                >
                                    Join Room <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── AI Showcase Section (High Contrast Fixed) ─── */}
            <section id="ai" className="relative py-24 px-5 sm:px-8 bg-slate-50 dark:bg-slate-900/40">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Interactive MediMate Simulation Card */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-teal-500/20 rounded-[40px] blur-3xl" />
                            <div className="relative bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl">
                                <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
                                    <ConnectivityGraph mode="dark" speed={0.6} density={0.8} />
                                </div>
                                <div className="relative z-10">
                                    <div className="p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        </div>
                                        <span className="text-[11px] font-mono-numbers font-extrabold text-teal-400 tracking-wider">
                                            MEDIMATE AI • ACTIVE
                                        </span>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                                            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/5">
                                                <img
                                                    src="/assets/medimate-ai-logo.png"
                                                    alt="MediMate AI"
                                                    className="h-16 w-16 object-contain"
                                                    draggable={false}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-base font-extrabold text-white">MediMate Clinical AI</p>
                                                <p className="mt-1 text-xs text-slate-400">Intelligent triage and care pathway navigator</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-teal-600 text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-lg">
                                                "I've had a recurring fever for 3 days and joint discomfort. Should I book a clinic visit?"
                                            </div>
                                        </div>
                                        <div className="flex justify-start">
                                            <div className="bg-slate-800/90 text-slate-100 p-4 rounded-2xl rounded-tl-none text-sm max-w-[88%] border border-slate-700 shadow-xl">
                                                <div className="flex items-center gap-2 text-teal-400 font-bold text-[11px] uppercase tracking-wider mb-2">
                                                    <Bot className="h-3.5 w-3.5" /> Clinical Assessment
                                                </div>
                                                Based on your prolonged febrile duration and joint discomfort, you should be evaluated by an <strong>Internal Medicine Physician</strong>. Recommended Urgency: <strong className="text-amber-400">Medium</strong>.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Capabilities High-Contrast Copy */}
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/80 bg-teal-100/60 dark:border-teal-800 dark:bg-teal-950/50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-teal-800 dark:text-teal-300">
                                <Cpu className="h-3.5 w-3.5" /> Google Gemini Pro Powered
                            </div>
                            <h2 className="font-display mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
                                Integrated Intelligence in Every Interaction
                            </h2>
                            <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                                Eliminate patient wait-time bottlenecks and empower clinical decisions with continuous assistive AI embedded directly into consultations and appointment flows.
                            </p>

                            <ul className="mt-8 space-y-4">
                                {[
                                    'Context-aware symptom triage & urgency calculation',
                                    'Automated patient history synthesis for attending doctors',
                                    'Prescription safety checks & cross-reaction warning alerts',
                                    '24/7 patient guidance in plain, empathetic language'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                                        <div className="grid h-6 w-6 place-items-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 shrink-0">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
                                >
                                    Experience MediMate AI <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Virtual Clinic / Telehealth Highlight ─── */}
            <section id="telehealth" className="relative py-24 px-5 sm:px-8 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                                <Video className="h-3.5 w-3.5" /> Secure Telehealth Protocol
                            </div>
                            <h2 className="font-display mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
                                Launch Secure Virtual Consultations In Seconds
                            </h2>
                            <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                                No third-party downloads. Both patient and physician join the encrypted room with full patient history, pending lab results, and real-time prescription writing at their fingertips.
                            </p>

                            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700"
                                >
                                    Book a Telehealth Slot <ArrowRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-teal-300 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    Register as Patient
                                </button>
                            </div>
                        </div>

                        {/* Telehealth Visual Preview */}
                        <div className="relative overflow-hidden rounded-[32px] border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
                            <div className="pointer-events-none absolute inset-0 z-0 opacity-15">
                                <ParticleNetwork mode="auto" speed={0.4} density={0.5} />
                            </div>
                            <div className="relative z-10 aspect-video overflow-hidden rounded-2xl bg-slate-950">
                                <div className="grid h-full grid-cols-2 gap-1 p-1">
                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700">
                                        <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
                                            Dr. Attending
                                        </div>
                                        <Stethoscope className="absolute bottom-6 left-1/2 h-16 w-16 -translate-x-1/2 text-white/80" />
                                    </div>
                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700">
                                        <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
                                            Patient Connected
                                        </div>
                                        <Smartphone className="absolute bottom-6 left-1/2 h-16 w-16 -translate-x-1/2 text-white/80" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {['1080p HD Video', 'End-to-End Encrypted', 'One-Click Room Join'].map((item) => (
                                    <div key={item} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-center text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer & Developer Profile ─── */}
            <footer id="developer" className="relative overflow-hidden border-t border-slate-200 bg-slate-950 px-5 sm:px-8 py-16 text-white dark:border-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_32rem),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.14),transparent_28rem)]" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500 text-white shadow-xl shadow-teal-500/20">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-display text-xl font-extrabold tracking-tight">MediCare HMS</p>
                                    <p className="text-xs font-bold text-slate-400">Hospital Management Operating System</p>
                                </div>
                            </div>

                            <div className="mt-8 max-w-xl rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <img
                                        src="/rahul.jpg"
                                        alt="Rahul Singh Kushwah"
                                        className="h-18 w-18 rounded-2xl border-2 border-white/20 object-cover shadow-xl"
                                    />
                                    <div>
                                        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-400">Lead Architect & Engineer</p>
                                        <h3 className="font-display mt-1 text-2xl font-extrabold tracking-tight">Rahul Singh Kushwah</h3>
                                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
                                            <span className="inline-flex items-center gap-1"><Code2 className="h-3.5 w-3.5 text-teal-400" /> Full Stack Developer</span>
                                            <span>•</span>
                                            <span className="inline-flex items-center gap-1"><Palette className="h-3.5 w-3.5 text-cyan-400" /> UI/UX Designer</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-xs leading-relaxed text-slate-400">
                                    Crafting resilient full-stack systems with enterprise Java Spring Boot, modern React architectures, and professional UI/UX standards.
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
                                        className="group rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition-all hover:-translate-y-0.5 hover:border-teal-300/40 hover:bg-white/[0.08]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400/10 text-teal-300">
                                                <link.icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{link.label}</p>
                                                <p className="truncate text-sm font-bold text-slate-100 group-hover:text-teal-200">{link.value}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>

                            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Developer Channels</p>
                                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                    {developerLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-xs font-bold text-slate-300 transition-all hover:border-teal-400/50 hover:bg-teal-400/10 hover:text-white"
                                        >
                                            <link.icon className="h-4 w-4 text-teal-400 transition-transform group-hover:scale-110" />
                                            <span className="truncate">{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>© 2026 MediCare HMS. All rights reserved.</p>
                        <p className="font-semibold text-slate-400">Full-Stack Spring Boot + React + Three.js Operating Architecture</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
