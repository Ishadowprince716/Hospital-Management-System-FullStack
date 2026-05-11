import { getRedirectResult, signInWithRedirect, type UserCredential } from 'firebase/auth';
import api from '../api';
import { auth, googleProvider } from '../firebase';

export type FirebaseRole = 'PATIENT' | 'DOCTOR';

export type FirebaseAuthResponse = {
    token: string;
    username: string;
    role: string;
    userId: number;
    fullName: string;
    profilePictureUrl?: string;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };

const GOOGLE_AUTH_ROLE_KEY = 'hms_google_auth_role';

const configureGoogleProvider = () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
};

const completeGoogleCredential = async (credential: UserCredential, role: FirebaseRole) => {
    const idToken = await credential.user.getIdToken();
    const response = await api.post<ApiResponse<FirebaseAuthResponse>>('/auth/firebase', {
        idToken,
        role,
    });

    return {
        auth: response.data.data,
        email: credential.user.email || '',
    };
};

export const signInWithGoogleAccount = async (role: FirebaseRole) => {
    configureGoogleProvider();
    sessionStorage.setItem(GOOGLE_AUTH_ROLE_KEY, role);
    await signInWithRedirect(auth, googleProvider);
};

export const completeGoogleRedirectSignIn = async (fallbackRole: FirebaseRole) => {
    const credential = await getRedirectResult(auth);
    if (!credential) return null;

    const savedRole = sessionStorage.getItem(GOOGLE_AUTH_ROLE_KEY) as FirebaseRole | null;
    sessionStorage.removeItem(GOOGLE_AUTH_ROLE_KEY);
    const role = savedRole === 'DOCTOR' || savedRole === 'PATIENT' ? savedRole : fallbackRole;

    return completeGoogleCredential(credential, role);
};

export const getFirebaseAuthErrorMessage = (error: unknown) => {
    const maybeError = error as { code?: string; message?: string };
    const code = maybeError?.code || '';

    if (code === 'auth/unauthorized-domain') {
        return 'Google login is blocked because this Railway domain is not added in Firebase Authorized domains.';
    }
    if (code === 'auth/operation-not-allowed') {
        return 'Google login is not enabled in Firebase Authentication. Enable Google provider in Firebase Console.';
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return 'Google login was cancelled before it finished.';
    }
    if (code === 'auth/network-request-failed') {
        return 'Network error while connecting to Google. Please check internet and try again.';
    }

    return maybeError?.message || 'Google sign-in failed. Please try again.';
};
