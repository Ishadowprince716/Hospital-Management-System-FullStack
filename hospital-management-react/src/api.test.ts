import { describe, expect, it, beforeEach, vi } from 'vitest';
import api, { getApiErrorMessage } from './api';

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

    it('returns fallback when axios error has no response object (network error)', () => {
        const axiosError = {
            isAxiosError: true,
            response: undefined,
        } as unknown;

        expect(getApiErrorMessage(axiosError, 'Fallback')).toBe('Fallback');
    });

    it('returns fallback when error is a string or primitive', () => {
        expect(getApiErrorMessage('string error', 'Fallback')).toBe('Fallback');
        expect(getApiErrorMessage(null, 'Fallback')).toBe('Fallback');
        expect(getApiErrorMessage(undefined, 'Fallback')).toBe('Fallback');
    });
});

describe('api interceptors', () => {
    let mockStore: Record<string, string> = {};

    beforeEach(() => {
        mockStore = {};
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => mockStore[key] ?? null,
            setItem: (key: string, val: string) => { mockStore[key] = String(val); },
            removeItem: (key: string) => { delete mockStore[key]; },
            clear: () => { mockStore = {}; },
        });

        // Mock window.location to prevent JSDOM navigation error logs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).location;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.location = { href: '', origin: 'http://localhost:3000' } as any;
    });

    it('attaches JWT bearer token when available in localStorage', () => {
        localStorage.setItem('token', 'test-mock-jwt-token');

        // Access the registered request interceptor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requestHandlers = (api.interceptors.request as any).handlers;
        expect(requestHandlers.length).toBeGreaterThan(0);

        const config = { headers: {} as Record<string, string> };
        const result = requestHandlers[0].fulfilled(config);

        expect(result.headers.Authorization).toBe('Bearer test-mock-jwt-token');
    });

    it('does not attach Authorization header when token is absent', () => {
        localStorage.removeItem('token');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requestHandlers = (api.interceptors.request as any).handlers;
        const config = { headers: {} as Record<string, string> };
        const result = requestHandlers[0].fulfilled(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    it('clears credentials on 401 response and rejects promise', async () => {
        localStorage.setItem('token', 'expired-token');
        localStorage.setItem('user', JSON.stringify({ name: 'test' }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseHandlers = (api.interceptors.response as any).handlers;
        expect(responseHandlers.length).toBeGreaterThan(0);

        const error = {
            response: { status: 401 },
        };

        await expect(responseHandlers[0].rejected(error)).rejects.toEqual(error);
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('passes through non-401 response errors without clearing storage', async () => {
        localStorage.setItem('token', 'valid-token');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseHandlers = (api.interceptors.response as any).handlers;
        const error = {
            response: { status: 500 },
        };

        await expect(responseHandlers[0].rejected(error)).rejects.toEqual(error);
        expect(localStorage.getItem('token')).toBe('valid-token');
    });

    it('passes through successful response unchanged', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseHandlers = (api.interceptors.response as any).handlers;
        const mockResponse = { data: { success: true }, status: 200 };

        const result = responseHandlers[0].fulfilled(mockResponse);
        expect(result).toBe(mockResponse);
    });
});
