import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

type Tone = 'blue' | 'teal' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';

const toneStyles: Record<Tone, { icon: string; soft: string; border: string; text: string }> = {
    blue: {
        icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
        soft: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
        border: 'border-blue-100 dark:border-blue-900/60',
        text: 'text-blue-600 dark:text-blue-300',
    },
    teal: {
        icon: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300',
        soft: 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300',
        border: 'border-teal-100 dark:border-teal-900/60',
        text: 'text-teal-600 dark:text-teal-300',
    },
    emerald: {
        icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
        soft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
        border: 'border-emerald-100 dark:border-emerald-900/60',
        text: 'text-emerald-600 dark:text-emerald-300',
    },
    amber: {
        icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
        soft: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
        border: 'border-amber-100 dark:border-amber-900/60',
        text: 'text-amber-600 dark:text-amber-300',
    },
    purple: {
        icon: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
        soft: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300',
        border: 'border-purple-100 dark:border-purple-900/60',
        text: 'text-purple-600 dark:text-purple-300',
    },
    rose: {
        icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
        soft: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
        border: 'border-rose-100 dark:border-rose-900/60',
        text: 'text-rose-600 dark:text-rose-300',
    },
    slate: {
        icon: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300',
        soft: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-800',
        text: 'text-slate-600 dark:text-slate-300',
    },
};

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

export const patientCardClass =
    'rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-950';

export const PatientPageFrame: React.FC<{
    children: React.ReactNode;
    className?: string;
    size?: 'md' | 'lg' | 'xl';
}> = ({ children, className = '', size = 'xl' }) => {
    const maxWidth = size === 'md' ? 'max-w-4xl' : size === 'lg' ? 'max-w-5xl' : 'max-w-7xl';

    return (
        <div className={cx('mx-auto w-full space-y-5 pb-8 animate-fadeIn', maxWidth, className)}>
            {children}
        </div>
    );
};

export const PatientPageHeader: React.FC<{
    title: string;
    description: string;
    icon: LucideIcon;
    tone?: Tone;
    action?: React.ReactNode;
    eyebrow?: string;
}> = ({ title, description, icon: Icon, tone = 'blue', action, eyebrow }) => {
    const toneClass = toneStyles[tone];

    return (
        <div className={cx(patientCardClass, 'overflow-hidden')}>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-lg', toneClass.icon)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        {eyebrow && (
                            <p className={cx('mb-1 text-xs font-bold uppercase tracking-wide', toneClass.text)}>
                                {eyebrow}
                            </p>
                        )}
                        <h1 className="text-2xl font-bold leading-tight text-slate-950 dark:text-white">{title}</h1>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </div>
    );
};

export const PatientStatCard: React.FC<{
    label: string;
    value: React.ReactNode;
    icon: LucideIcon;
    tone?: Tone;
    helper?: string;
}> = ({ label, value, icon: Icon, tone = 'blue', helper }) => {
    const toneClass = toneStyles[tone];

    return (
        <div className={cx(patientCardClass, 'p-4 transition-all hover:-translate-y-0.5 hover:shadow-md')}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</div>
                    {helper && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
                </div>
                <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-lg', toneClass.icon)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};

export const PatientAlert: React.FC<{
    children: React.ReactNode;
    icon: LucideIcon;
    tone?: Tone;
}> = ({ children, icon: Icon, tone = 'amber' }) => {
    const toneClass = toneStyles[tone];

    return (
        <div className={cx('flex items-start gap-3 rounded-lg border p-4 text-sm', toneClass.soft, toneClass.border)}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="font-medium leading-6">{children}</div>
        </div>
    );
};

export const PatientEmptyState: React.FC<{
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
    <div className={cx(patientCardClass, 'px-6 py-14 text-center')}>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export const PatientLoader: React.FC<{ label?: string }> = ({ label = 'Loading patient data' }) => (
    <div className={cx(patientCardClass, 'flex items-center justify-center gap-3 py-12 text-sm text-slate-500 dark:text-slate-400')}>
        <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-300" />
        {label}
    </div>
);
