import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Calendar, FileText, CheckCircle, AlertCircle, Stethoscope, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Doctor {
    id: number;
    fullName: string;
    specialization: string;
    department: string;
    consultationFee: number;
    profilePictureUrl?: string;
    availableTimeStart?: string;
    availableTimeEnd?: string;
    availableDays?: string;
}

const BookAppointment: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [step, setStep] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctors?size=50');
                const doctorList = response.data?.data?.content || response.data?.data || [];
                setDoctors(doctorList);
            } catch (err) {
                console.error('Failed to fetch doctors', err);
                setError('Could not load the list of available doctors.');
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctor || !date || !time) return;

        setSubmitting(true);
        setError(null);

        try {
            await api.post('/appointments', {
                patientId: user?.id,
                doctorId: selectedDoctor.id,
                date: date,
                time: time + ':00', // Backend expects HH:mm:ss format LocalTime
                reason: reason,
                type: 'GENERAL'
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/patient');
            }, 3000);
        } catch (err: unknown) {
            console.error('Booking failed', err);
            setError(getApiErrorMessage(err, 'Failed to book appointment. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2">Appointment Confirmed!</h2>
                <p className="text-[var(--text-muted)] text-lg text-center max-w-md">
                    Your appointment with Dr. {selectedDoctor?.fullName} has been scheduled for {new Date(date).toLocaleDateString()} at {time}.
                </p>
                <div className="mt-8 flex gap-4">
                    <Button onClick={() => navigate('/patient/appointments')} className="bg-[var(--primary)] text-white">
                        View My Appointments
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-color)]">Book Appointment</h1>
                    <p className="text-[var(--text-muted)] mt-1">Schedule a consultation with our specialists</p>
                </div>
                
                {/* Stepper */}
                <div className="hidden sm:flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <div className={`w-12 h-1 ${step >= 2 ? 'bg-[var(--primary)]' : 'bg-gray-200'}`} />
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    <div className={`w-12 h-1 ${step >= 3 ? 'bg-[var(--primary)]' : 'bg-gray-200'}`} />
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 3 ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl text-red-600 bg-red-50 border border-red-200 animate-fadeIn">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    
                    {/* Step 1: Select Doctor */}
                    {step === 1 && (
                        <div className="p-6 animate-fadeIn">
                            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4 flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-[var(--primary)]" />
                                Select a Specialist
                            </h2>
                            
                            {loadingDoctors ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-28 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="text-center py-12 text-[var(--text-muted)]">
                                    No doctors available at the moment.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                                    {doctors.map(doctor => (
                                        <div 
                                            key={doctor.id}
                                            onClick={() => { setSelectedDoctor(doctor); setStep(2); }}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDoctor?.id === doctor.id ? 'border-[var(--primary)] bg-blue-50/50 dark:bg-blue-900/10' : 'border-[var(--border-color)] hover:border-blue-300'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg shrink-0">
                                                    {doctor.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[var(--text-color)]">Dr. {doctor.fullName}</h3>
                                                    <p className="text-sm font-medium text-[var(--primary)]">{doctor.specialization || 'General Physician'}</p>
                                                    <div className="mt-2 text-xs text-[var(--text-muted)] space-y-1">
                                                        <p>Fee: ₹{doctor.consultationFee || 500}</p>
                                                        {doctor.availableTimeStart && <p>Hours: {doctor.availableTimeStart} - {doctor.availableTimeEnd}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Date & Time */}
                    {step === 2 && (
                        <div className="p-6 animate-fadeIn">
                            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-6 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-[var(--primary)]" />
                                Choose Date & Time
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-[var(--text-color)]">Select Date</label>
                                    <Input 
                                        type="date" 
                                        min={today}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full h-12 text-lg"
                                        required
                                    />
                                    {selectedDoctor?.availableDays && (
                                        <p className="text-xs text-[var(--text-muted)] mt-2">
                                            Doctor is generally available: {selectedDoctor.availableDays}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-[var(--text-color)]">Select Time</label>
                                    <Input 
                                        type="time" 
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full h-12 text-lg"
                                        required
                                    />
                                     <p className="text-xs text-[var(--text-muted)] mt-2">
                                        Please choose a time within doctor's working hours.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button 
                                    onClick={() => setStep(3)} 
                                    disabled={!date || !time}
                                    className="bg-[var(--primary)] text-white"
                                >
                                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details & Confirm */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="p-6 animate-fadeIn">
                            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-6 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[var(--primary)]" />
                                Additional Details
                            </h2>

                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl mb-6 border border-[var(--border-color)]">
                                <h3 className="text-sm font-semibold text-[var(--text-color)] mb-2">Appointment Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-[var(--text-muted)] block">Doctor</span>
                                        <span className="font-medium text-[var(--text-color)]">Dr. {selectedDoctor?.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)] block">Specialty</span>
                                        <span className="font-medium text-[var(--text-color)]">{selectedDoctor?.specialization || 'General'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)] block">Date</span>
                                        <span className="font-medium text-[var(--text-color)]">{date ? new Date(date).toLocaleDateString() : ''}</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)] block">Time</span>
                                        <span className="font-medium text-[var(--text-color)]">{time}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="block text-sm font-medium text-[var(--text-color)]">Reason for visit</label>
                                <textarea 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full min-h-[100px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="Briefly describe your symptoms or reason for consultation..."
                                    required
                                />
                            </div>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                                <Button 
                                    type="submit" 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                                    isLoading={submitting}
                                >
                                    Confirm Booking
                                </Button>
                            </div>
                        </form>
                    )}

                </CardContent>
            </Card>
        </div>
    );
};

export default BookAppointment;
