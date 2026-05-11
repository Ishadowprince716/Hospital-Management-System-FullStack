import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="mb-2 block text-sm font-semibold text-[var(--text-color)]"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={id}
                    className={cn(
                        'flex h-11 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3.5 py-2 text-sm text-[var(--text-color)] shadow-[var(--shadow-sm)] placeholder:text-[var(--text-soft)] focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
