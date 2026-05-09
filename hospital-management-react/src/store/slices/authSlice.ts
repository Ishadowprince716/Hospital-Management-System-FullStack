import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    fullName: string;
    phoneNumber?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const userStr = localStorage.getItem('user');
let initialUser = null;
try {
    if (userStr) initialUser = JSON.parse(userStr);
} catch (e) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}

const initialState: AuthState = {
    user: initialUser,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token') && !!initialUser,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        initializeAuth: (state) => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
                state.token = token;
                state.user = JSON.parse(userStr);
                state.isAuthenticated = true;
            }
        }
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
