import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { API_BASE } from '../../api';
import { logout } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithSessionRecovery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        api.dispatch(logout());
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.assign('/login');
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithSessionRecovery,
    tagTypes: ['Patient', 'Doctor', 'Appointment', 'Prescription', 'MedicalRecord', 'MedicalReport', 'Billing', 'User', 'Analytics'],
    endpoints: () => ({}),
});
