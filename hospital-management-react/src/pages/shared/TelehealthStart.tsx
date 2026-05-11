import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CalendarCheck, ArrowRight, Video, ShieldCheck } from 'lucide-react';
import type { RootState } from '../../store';

const appointmentPathByRole: Record<string, string> = {
    PATIENT: '/patient/appointments',
    DOCTOR: '/doctor/appointments',
    ADMIN: '/admin/appointments',
};

const TelehealthStart: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const appointmentPath = appointmentPathByRole[user?.role || 'PATIENT'] || '/patient/appointments';

    return (
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center justify-center px-4 py-10">
            <div className="surface-panel w-full overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="p-7 sm:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-widest"
                            style={{ background: 'var(--primary-soft)', borderColor: 'var(--ring)', color: 'var(--primary)' }}>
                            <Video className="h-4 w-4" />
                            Telehealth
                        </div>
                        <h1 className="mt-5 text-3xl font-black tracking-tight text-[var(--text-color)] sm:text-4xl">
                            Start a video call from an appointment
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                            Telehealth rooms are linked to appointment IDs, so both patient and doctor join the correct secure consultation room. Open your appointments and press the video call button for a scheduled visit.
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => navigate(appointmentPath)}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,118,110,0.20)] transition-all hover:bg-[var(--primary-dark)]"
                            >
                                Open Appointments
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-5 text-sm font-bold text-[var(--text-color)] transition-all hover:border-[var(--border-strong)]"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border-color)] bg-slate-50/80 p-7 dark:bg-slate-950/40 lg:border-l lg:border-t-0">
                        <div className="grid h-full min-h-[280px] place-items-center rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                            <div className="text-center">
                                <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-teal-50 text-teal-700 shadow-sm dark:bg-teal-950/40 dark:text-teal-300">
                                    <ShieldCheck className="h-10 w-10" />
                                </div>
                                <h2 className="mt-5 text-xl font-black text-[var(--text-color)]">Secure appointment room</h2>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                                    Use the appointment flow so the system can create or fetch the correct room before opening the video screen.
                                </p>
                                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    <CalendarCheck className="h-4 w-4" />
                                    Appointment required
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelehealthStart;
