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
                'rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm backdrop-blur-sm bg-opacity-90',
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
            className={cn('flex flex-col space-y-1.5 p-6', className)}
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
            className={cn('font-semibold leading-none tracking-tight text-xl', className)}
            {...props}
        >
            {children}
        </h3>
    );
};

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn('flex items-center p-6 pt-0', className)}
            {...props}
        >
            {children}
        </div>
    );
};
