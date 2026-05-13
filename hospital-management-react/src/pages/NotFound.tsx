import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import type { RootState } from '../store';
import { Button } from '../components/ui/Button';

const homeByRole: Record<string, string> = {
    ADMIN: '/admin',
    DOCTOR: '/doctor',
    PATIENT: '/patient',
};

const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const homePath = isAuthenticated ? homeByRole[user?.role || 'PATIENT'] || '/patient' : '/';

    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--bg-color)] px-4 py-10 text-[var(--text-color)]">
            <section className="w-full max-w-xl rounded-lg border border-[var(--border-color)] bg-[var(--card-elevated)] p-6 text-center shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <SearchX className="h-7 w-7" />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-soft)]">404</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Page not found</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
                    This HMS page may have moved, or the link is not available for your current account role.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button type="button" onClick={() => navigate(homePath)} className="gap-2">
                        <Home className="h-4 w-4" />
                        Go to dashboard
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
            </section>
        </main>
    );
};

export default NotFound;
