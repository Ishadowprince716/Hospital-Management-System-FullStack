import React, { useEffect, useState } from 'react';
import { Users, Loader2, Search, Eye, Calendar, FileText, X, Phone, Mail, Droplet } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface Patient {
    id: number;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    patientAge?: number;
    bloodGroup?: string;
    gender?: string;
    address?: string;
    lastVisit?: string;
    appointmentCount?: number;
}
interface PatientAppointment {
    patient?: Patient;
    patientId?: number;
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    appointmentDate?: string;
}

const DoctorMyPatients: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Patient | null>(null);

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const apptRes = await api.get('/appointments/my?size=200&sort=appointmentDate,desc');
                const appts: PatientAppointment[] = apptRes.data?.data?.content || apptRes.data?.data || [];
                const seen = new Map<number, Patient>();

                for (const appointment of appts) {
                    const id = appointment.patient?.id || appointment.patientId;
                    const fullName = appointment.patient?.fullName || appointment.patientName;
                    if (!id || !fullName) continue;

                    const existing = seen.get(id);
                    if (existing) {
                        existing.appointmentCount = (existing.appointmentCount || 0) + 1;
                        continue;
                    }

                    seen.set(id, {
                        id,
                        fullName,
                        email: appointment.patient?.email,
                        phoneNumber: appointment.patient?.phoneNumber,
                        patientAge: appointment.patient?.patientAge || appointment.patientAge,
                        bloodGroup: appointment.patient?.bloodGroup,
                        gender: appointment.patient?.gender || appointment.patientGender,
                        address: appointment.patient?.address,
                        lastVisit: appointment.appointmentDate,
                        appointmentCount: 1,
                    });
                }

                setPatients(Array.from(seen.values()));
            } catch {
                setPatients([]);
            } finally { setLoading(false); }
        };
        if (user?.id) fetchPatients();
    }, [user?.id]);

    const filtered = patients.filter(p =>
        (p.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.phoneNumber || '').includes(search)
    );

    const calcAge = (dob?: string) => {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    };

    const displayAge = (patient: Patient) => patient.patientAge ?? calcAge(patient.dateOfBirth);

    const bloodColors: Record<string, string> = {
        'A+': 'bg-red-100 text-red-700 border-red-200',
        'A-': 'bg-red-100 text-red-700 border-red-200',
        'B+': 'bg-blue-100 text-blue-700 border-blue-200',
        'B-': 'bg-blue-100 text-blue-700 border-blue-200',
        'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
        'AB-': 'bg-purple-100 text-purple-700 border-purple-200',
        'O+': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'O-': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <Users className="h-6 w-6 text-teal-600" /> My Patients
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        All patients you have seen or have upcoming appointments with.
                    </p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by name, email, phone..." className="pl-9 h-10"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex gap-6 px-5 py-3 rounded-xl border border-[var(--border-color)]" style={{ background: 'var(--card-bg)' }}>
                <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">{patients.length}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Patients</p>
                </div>
                <div className="w-px bg-[var(--border-color)]" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                        {patients.filter(p => displayAge(p) !== null && displayAge(p)! < 18).length}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Under 18</p>
                </div>
                <div className="w-px bg-[var(--border-color)]" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                        {patients.filter(p => displayAge(p) !== null && displayAge(p)! >= 60).length}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Senior (60+)</p>
                </div>
            </div>

            {/* Patient list */}
            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>
                                {search ? 'No matching patients' : 'No patients yet'}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                {search ? 'Try a different search term.' : 'Patients will appear here after their first appointment with you.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {filtered.map(patient => {
                                const age = displayAge(patient);
                                const bloodCls = bloodColors[patient.bloodGroup || ''] || 'bg-gray-100 text-gray-600 border-gray-200';
                                return (
                                    <div key={patient.id}
                                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        {/* Avatar */}
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
                                            {(patient.fullName || 'P').charAt(0).toUpperCase()}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                                                    {patient.fullName}
                                                </p>
                                                {patient.bloodGroup && (
                                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold border ${bloodCls}`}>
                                                        <Droplet className="h-2.5 w-2.5" /> {patient.bloodGroup}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-3 mt-0.5 flex-wrap">
                                                {patient.email && (
                                                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        <Mail className="h-3 w-3" /> {patient.email}
                                                    </span>
                                                )}
                                                {patient.phoneNumber && (
                                                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        <Phone className="h-3 w-3" /> {patient.phoneNumber}
                                                    </span>
                                                )}
                                                {age !== null && (
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Age {age}</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Meta */}
                                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                                            {patient.appointmentCount !== undefined && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                                                    {patient.appointmentCount} visit{patient.appointmentCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {patient.lastVisit && (
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    Last: {new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        {/* Actions */}
                                        <div className="flex gap-1.5 shrink-0">
                                            <button onClick={() => setSelected(patient)}
                                                className="p-2 rounded-xl border border-[var(--border-color)] hover:border-teal-400 hover:text-teal-600 transition-colors" title="View Details">
                                                <Eye className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                            </button>
                                            <button
                                                onClick={() => navigate('/doctor/appointments')}
                                                className="p-2 rounded-xl border border-[var(--border-color)] hover:border-blue-400 hover:text-blue-600 transition-colors" title="View Appointments">
                                                <Calendar className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                            </button>
                                            <button
                                                onClick={() => navigate('/doctor/medical-records')}
                                                className="p-2 rounded-xl border border-[var(--border-color)] hover:border-purple-400 hover:text-purple-600 transition-colors" title="Medical Records">
                                                <FileText className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Patient Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fadeIn" style={{ background: 'var(--card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Patient Details</h3>
                            <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[var(--border-color)]">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow">
                                {(selected.fullName || 'P').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-base" style={{ color: 'var(--text-color)' }}>{selected.fullName}</p>
                                {selected.bloodGroup && (
                                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold border ${bloodColors[selected.bloodGroup] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        <Droplet className="h-3 w-3" /> {selected.bloodGroup}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { l: 'Email',       v: selected.email },
                                { l: 'Phone',       v: selected.phoneNumber },
                                { l: 'Gender',      v: selected.gender },
                                { l: 'Age',         v: displayAge(selected) ? `${displayAge(selected)} years` : null },
                                { l: 'Address',     v: selected.address },
                                { l: 'Total Visits', v: selected.appointmentCount?.toString() },
                                { l: 'Last Visit',  v: selected.lastVisit ? new Date(selected.lastVisit).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }) : null },
                            ].filter(r => r.v).map(row => (
                                <div key={row.l} className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.l}</span>
                                    <span className="text-sm font-medium text-right max-w-[60%]" style={{ color: 'var(--text-color)' }}>{row.v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-5">
                            <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={() => { setSelected(null); navigate('/doctor/medical-records'); }}>
                                Medical Records
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorMyPatients;
