import { apiSlice } from './apiSlice';

export const telehealthApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTelehealthSession: builder.query<any, number>({
            query: (appointmentId) => `/telehealth/session/${appointmentId}`,
            providesTags: (result) => [{ type: 'Appointment', id: result?.data?.appointment?.id }],
        }),
        endTelehealthSession: builder.mutation<any, number>({
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
