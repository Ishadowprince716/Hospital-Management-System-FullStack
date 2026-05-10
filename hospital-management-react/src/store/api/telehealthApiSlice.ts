import { apiSlice } from './apiSlice';

interface TelehealthSessionResponse {
    data?: {
        roomName?: string;
        appointment?: {
            id?: number;
        };
    };
}

export const telehealthApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTelehealthSession: builder.query<TelehealthSessionResponse, number>({
            query: (appointmentId) => `/telehealth/session/${appointmentId}`,
            providesTags: (result) => [{ type: 'Appointment', id: result?.data?.appointment?.id }],
        }),
        endTelehealthSession: builder.mutation<unknown, number>({
            query: (appointmentId) => ({
                url: `/telehealth/session/${appointmentId}/end`,
                method: 'POST',
            }),
            invalidatesTags: ['Appointment'],
        }),
    }),
});

export const { 
    useGetTelehealthSessionQuery, 
    useEndTelehealthSessionMutation 
} = telehealthApiSlice;
