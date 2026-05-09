import { apiSlice } from './apiSlice';

export const patientApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPatientPrescriptions: builder.query<any, number>({
            query: (patientId) => `/prescriptions/patient/${patientId}?size=50`,
            providesTags: ['Prescription'],
        }),
        getPatientMedicalReports: builder.query<any, number>({
            query: (patientId) => `/reports/patient/${patientId}?size=50`,
            providesTags: ['MedicalReport'],
        }),
    }),
});

export const { 
    useGetPatientPrescriptionsQuery, 
    useGetPatientMedicalReportsQuery 
} = patientApiSlice;
