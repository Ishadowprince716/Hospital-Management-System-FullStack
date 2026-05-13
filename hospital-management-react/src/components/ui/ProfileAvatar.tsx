import React, { useMemo, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getProfileImageUrl } from '../../utils/profileImage';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProfileAvatarProps {
    profilePictureUrl?: string;
    name?: string;
    alt?: string;
    className?: string;
    imageClassName?: string;
    fallbackClassName?: string;
}

const getInitials = (name?: string) => {
    const parts = (name || 'User').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    profilePictureUrl,
    name,
    alt = '',
    className,
    imageClassName,
    fallbackClassName,
}) => {
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const imageUrl = useMemo(() => getProfileImageUrl(profilePictureUrl), [profilePictureUrl]);
    const canShowImage = imageUrl && failedImageUrl !== imageUrl;

    if (canShowImage) {
        return (
            <img
                src={imageUrl}
                alt={alt}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setFailedImageUrl(imageUrl)}
                className={cn('object-cover', className, imageClassName)}
            />
        );
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center bg-slate-600 font-bold text-white',
                className,
                fallbackClassName
            )}
            aria-label={alt || name || 'User avatar'}
        >
            {getInitials(name)}
        </div>
    );
};
