export const formatDoctorName = (name?: string | null, fallback = 'N/A') => {
    const cleanName = name?.trim();
    if (!cleanName) return fallback;
    return /^dr\.?\s/i.test(cleanName) ? cleanName : `Dr. ${cleanName}`;
};
