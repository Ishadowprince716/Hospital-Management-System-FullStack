import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'rounded-lg border border-[var(--border-color)] bg-[var(--card-elevated)] text-[var(--text-color)] shadow-[var(--shadow-sm)] backdrop-blur transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn('flex flex-col space-y-1.5 p-5 sm:p-6', className)}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <h3
            className={cn('text-lg font-bold leading-tight tracking-normal text-[var(--text-color)] sm:text-xl', className)}
            {...props}
        >
            {children}
        </h3>
    );
};

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn('flex items-center p-5 pt-0 sm:p-6 sm:pt-0', className)}
            {...props}
        >
            {children}
        </div>
    );
};
