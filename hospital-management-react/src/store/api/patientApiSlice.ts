import { apiSlice } from './apiSlice';

type ApiListResponse<T = unknown> = {
    data?: T[] | { content?: T[] };
};

export const patientApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPatientPrescriptions: builder.query<ApiListResponse, number>({
            query: (patientId) => `/prescriptions/patient/${patientId}?size=50`,
            providesTags: ['Prescription'],
        }),
        getPatientMedicalReports: builder.query<ApiListResponse, number>({
            query: (patientId) => `/reports/patient/${patientId}?size=50`,
            providesTags: ['MedicalReport'],
        }),
    }),
});

export const { 
    useGetPatientPrescriptionsQuery, 
    useGetPatientMedicalReportsQuery 
} = patientApiSlice;
