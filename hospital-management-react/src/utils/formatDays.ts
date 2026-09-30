/**
 * Utility functions for parsing and displaying doctor availability days.
 * Doctors store days in DB as JSON string e.g. ["Monday", "Tuesday", ...]
 * or comma-separated string e.g. "Monday, Tuesday, Wednesday".
 */

export const ALL_WEEKDAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
] as const;

export const parseAvailableDays = (raw?: string | string[] | null): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
        return raw.map(String).map(s => s.trim()).filter(Boolean);
    }
    const trimmed = String(raw).trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed.map(String).map(s => s.trim()).filter(Boolean);
        }
        return [];
    } catch {
        // If it was attempted object JSON, reject
        if (trimmed.startsWith('{')) return [];
    }
    return trimmed
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
};

export const formatAvailableDays = (raw?: string | string[] | null): string => {
    const days = parseAvailableDays(raw);
    if (days.length === 0) return 'Not available';
    if (days.length === 7) return 'All Days (Mon – Sun)';
    const weekdaySet = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    if (days.length === 5 && days.every(d => weekdaySet.has(d))) {
        return 'Weekdays (Mon – Fri)';
    }
    if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
        return 'Weekends (Sat – Sun)';
    }
    return days.map(d => d.slice(0, 3)).join(', ');
};
