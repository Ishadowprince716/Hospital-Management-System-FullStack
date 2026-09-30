import { describe, expect, it } from 'vitest';
import { parseAvailableDays, formatAvailableDays, ALL_WEEKDAYS } from './utils/formatDays';

describe('formatDays utility', () => {
    it('defines all 7 weekdays in standard order', () => {
        expect(ALL_WEEKDAYS).toEqual([
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ]);
    });

    it('parses valid JSON array strings correctly', () => {
        expect(parseAvailableDays('["Monday", "Wednesday", "Friday"]')).toEqual([
            'Monday', 'Wednesday', 'Friday'
        ]);
    });

    it('parses already-parsed string arrays directly', () => {
        expect(parseAvailableDays(['Tuesday', 'Thursday'])).toEqual(['Tuesday', 'Thursday']);
    });

    it('handles comma-separated strings', () => {
        expect(parseAvailableDays('Monday, Wednesday, Friday')).toEqual([
            'Monday', 'Wednesday', 'Friday'
        ]);
    });

    it('handles empty, null, or invalid inputs gracefully', () => {
        expect(parseAvailableDays('')).toEqual([]);
        expect(parseAvailableDays(null)).toEqual([]);
        expect(parseAvailableDays(undefined)).toEqual([]);
        expect(parseAvailableDays('{invalid json}')).toEqual([]);
    });

    it('formats All Days (Mon - Sun)', () => {
        expect(formatAvailableDays(ALL_WEEKDAYS)).toBe('All Days (Mon – Sun)');
    });

    it('formats Weekdays (Mon - Fri)', () => {
        expect(formatAvailableDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])).toBe('Weekdays (Mon – Fri)');
    });

    it('formats Weekends (Sat - Sun)', () => {
        expect(formatAvailableDays(['Saturday', 'Sunday'])).toBe('Weekends (Sat – Sun)');
    });

    it('formats custom day combinations with abbreviated names', () => {
        expect(formatAvailableDays(['Monday', 'Wednesday', 'Friday'])).toBe('Mon, Wed, Fri');
    });

    it('returns fallback for empty availability', () => {
        expect(formatAvailableDays([])).toBe('Not available');
        expect(formatAvailableDays(null)).toBe('Not available');
    });
});
