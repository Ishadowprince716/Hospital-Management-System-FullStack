import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIAgent from '../shared/AIAgent';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const DashboardLayout: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user) return null; // Or loading spinner

    return (
        <div className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300">
            <Sidebar
                userRole={user.role}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <Navbar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <main className="md:pl-64 pt-16 min-h-screen transition-all duration-300">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>

            <AIAgent />

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
