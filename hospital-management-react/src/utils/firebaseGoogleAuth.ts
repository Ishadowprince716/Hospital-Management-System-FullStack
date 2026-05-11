import { signInWithPopup } from 'firebase/auth';
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

export const signInWithGoogleAccount = async (role: FirebaseRole) => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    const credential = await signInWithPopup(auth, googleProvider);
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
