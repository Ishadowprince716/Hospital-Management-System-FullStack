import { API_BASE } from '../api';

const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export const getProfileImageUrl = (profilePictureUrl?: string) => {
    if (!profilePictureUrl) return '';
    if (profilePictureUrl.startsWith('http')) return profilePictureUrl;

    const normalized = profilePictureUrl.replace(/^\/api\/uploads\//, '/uploads/');
    return `${API_ORIGIN}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
};
