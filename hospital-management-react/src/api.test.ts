import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api';

describe('getApiErrorMessage', () => {
    it('returns API message from axios error', () => {
        const axiosError = {
            isAxiosError: true,
            response: {
                data: { message: 'Custom API error' },
            },
        } as unknown;

        expect(getApiErrorMessage(axiosError, 'Fallback')).toBe('Custom API error');
    });

    it('returns fallback for non-axios errors', () => {
        expect(getApiErrorMessage(new Error('boom'), 'Fallback')).toBe('Fallback');
    });

    it('returns fallback when axios error has no server message', () => {
        const axiosError = {
            isAxiosError: true,
            response: {
                data: {},
            },
        } as unknown;

        expect(getApiErrorMessage(axiosError, 'Fallback')).toBe('Fallback');
    });
});
