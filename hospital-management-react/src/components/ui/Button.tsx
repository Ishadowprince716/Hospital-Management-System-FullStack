import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    ...props
}) => {
    const variants = {
        primary: 'bg-[var(--primary)] text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)] hover:bg-[var(--primary-dark)]',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        outline: 'border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] hover:border-[var(--border-strong)] hover:bg-slate-50 dark:hover:bg-slate-800',
        ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-slate-100 hover:text-[var(--text-color)] dark:hover:bg-slate-800',
        danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};
