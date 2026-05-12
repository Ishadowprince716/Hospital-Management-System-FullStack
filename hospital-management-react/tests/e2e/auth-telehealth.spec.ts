import { expect, test, type Page } from '@playwright/test';

const patientUser = process.env.HMS_PATIENT_USERNAME;
const patientPass = process.env.HMS_PATIENT_PASSWORD;
const doctorUser = process.env.HMS_DOCTOR_USERNAME;
const doctorPass = process.env.HMS_DOCTOR_PASSWORD;
const appointmentId = process.env.HMS_TEST_APPOINTMENT_ID;
const hasAuthEnv = Boolean(patientUser && patientPass && doctorUser && doctorPass);

const login = async (page: Page, username: string, password: string, role: 'PATIENT' | 'DOCTOR') => {
    await page.goto('/login');
    await page.getByRole('button', { name: role === 'PATIENT' ? 'Patient' : 'Doctor' }).click();
    await page.getByPlaceholder('Enter your username').fill(username);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
};

test('patient and doctor can login to their dashboards', async ({ browser }) => {
    test.skip(!hasAuthEnv, 'Set HMS_PATIENT_USERNAME/HMS_PATIENT_PASSWORD/HMS_DOCTOR_USERNAME/HMS_DOCTOR_PASSWORD.');

    const patientContext = await browser.newContext();
    const doctorContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const doctorPage = await doctorContext.newPage();

    await login(patientPage, patientUser!, patientPass!, 'PATIENT');
    await expect(patientPage).toHaveURL(/\/patient/);

    await login(doctorPage, doctorUser!, doctorPass!, 'DOCTOR');
    await expect(doctorPage).toHaveURL(/\/doctor/);

    await patientContext.close();
    await doctorContext.close();
});

test('telehealth room can be opened by both roles', async ({ browser }) => {
    test.skip(
        !hasAuthEnv || !appointmentId,
        'Set HMS_PATIENT_USERNAME/HMS_PATIENT_PASSWORD/HMS_DOCTOR_USERNAME/HMS_DOCTOR_PASSWORD/HMS_TEST_APPOINTMENT_ID.'
    );

    const patientContext = await browser.newContext();
    const doctorContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const doctorPage = await doctorContext.newPage();

    await login(patientPage, patientUser!, patientPass!, 'PATIENT');
    await login(doctorPage, doctorUser!, doctorPass!, 'DOCTOR');

    await patientPage.goto(`/telehealth/${appointmentId}`);
    await doctorPage.goto(`/telehealth/${appointmentId}`);

    await expect(patientPage.getByText(/Ready to connect|Appointment required|Private video consultation/i)).toBeVisible();
    await expect(doctorPage.getByText(/Ready to connect|Appointment required|Private video consultation/i)).toBeVisible();

    await patientContext.close();
    await doctorContext.close();
});
