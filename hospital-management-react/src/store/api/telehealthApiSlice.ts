import { apiSlice } from './apiSlice';

interface TelehealthSessionResponse {
    success?: boolean;
    message?: string;
    requestId?: string;
    timestamp?: string;
    data?: {
        id?: number;
        roomName?: string;
        appointmentId?: number;
        isActive?: boolean;
        status?: 'READY' | 'CALLING' | 'ACTIVE' | 'DECLINED' | 'ENDED';
        startedAt?: string;
        lastInviteAt?: string;
        declinedAt?: string;
        endedAt?: string;
        endedReason?: string;
        doctorName?: string;
        patientName?: string;
    };
}

interface TelehealthIceConfigResponse {
    success?: boolean;
    message?: string;
    requestId?: string;
    timestamp?: string;
    data?: {
        iceServers?: RTCIceServer[];
        turnConfigured?: boolean;
    };
}

export const telehealthApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTelehealthIceConfig: builder.query<TelehealthIceConfigResponse, void>({
            query: () => '/telehealth/ice-config',
        }),
        getTelehealthSession: builder.query<TelehealthSessionResponse, number>({
            query: (appointmentId) => `/telehealth/session/${appointmentId}`,
            providesTags: (result) => [{ type: 'Appointment', id: result?.data?.appointmentId }],
        }),
        endTelehealthSession: builder.mutation<unknown, number>({
            query: (appointmentId) => ({
                url: `/telehealth/session/${appointmentId}/end`,
                method: 'POST',
            }),
            invalidatesTags: ['Appointment'],
        }),
        startTelehealthSession: builder.mutation<TelehealthSessionResponse, number>({
            query: (appointmentId) => ({
                url: `/telehealth/session/${appointmentId}/start`,
                method: 'POST',
            }),
            invalidatesTags: ['Appointment'],
        }),
        declineTelehealthSession: builder.mutation<TelehealthSessionResponse, number>({
            query: (appointmentId) => ({
                url: `/telehealth/session/${appointmentId}/decline`,
                method: 'POST',
            }),
            invalidatesTags: ['Appointment'],
        }),
        joinTelehealthSession: builder.mutation<TelehealthSessionResponse, number>({
            query: (appointmentId) => ({
                url: `/telehealth/session/${appointmentId}/join`,
                method: 'POST',
            }),
            invalidatesTags: ['Appointment'],
        }),
    }),
});

export const { 
    useGetTelehealthIceConfigQuery,
    useGetTelehealthSessionQuery, 
    useEndTelehealthSessionMutation,
    useStartTelehealthSessionMutation,
    useDeclineTelehealthSessionMutation,
    useJoinTelehealthSessionMutation,
} = telehealthApiSlice;
