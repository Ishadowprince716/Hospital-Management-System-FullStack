import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarCheck, CheckCircle2, ClipboardList, Droplets, HeartPulse, Pill, Plus, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import {
    PatientAlert,
    PatientEmptyState,
    PatientLoader,
    PatientPageFrame,
    PatientPageHeader,
    PatientStatCard,
    patientCardClass,
} from '../../components/patient/PatientPanel';

type CareTask = {
    id: string | number;
    title: string;
    category: 'Medicine' | 'Exercise' | 'Diet' | 'Monitoring';
    time: string;
    done: boolean;
};

const STORAGE_KEY = 'hms.patient.carePlan';

const defaultTasks: CareTask[] = [
    { id: 'morning-medicine', title: 'Morning medicine', category: 'Medicine', time: '08:00', done: false },
    { id: 'bp-check', title: 'Blood pressure check', category: 'Monitoring', time: '10:00', done: false },
    { id: 'walk', title: '20 minute walk', category: 'Exercise', time: '17:30', done: false },
    { id: 'water', title: 'Drink 2 litres of water', category: 'Diet', time: 'All day', done: false },
];

const categoryIcons = {
    Medicine: Pill,
    Exercise: Activity,
    Diet: Droplets,
    Monitoring: HeartPulse,
};

const categoryStyles = {
    Medicine: 'bg-blue-50 text-blue-700 border-blue-100',
    Exercise: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Diet: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    Monitoring: 'bg-amber-50 text-amber-700 border-amber-100',
};

const loadTasks = (): CareTask[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultTasks;
    } catch {
        return defaultTasks;
    }
};

const CarePlan: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [tasks, setTasks] = useState<CareTask[]>(loadTasks);
    const [loading, setLoading] = useState(Boolean(user?.id));
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [newTask, setNewTask] = useState('');
    const [newTime, setNewTime] = useState('09:00');
    const [newCategory, setNewCategory] = useState<CareTask['category']>('Medicine');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchCarePlan = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/care-plan/patient/${user.id}`);
                const remoteTasks = Array.isArray(res.data?.data) ? res.data.data as CareTask[] : [];
                if (remoteTasks.length > 0) {
                    setTasks(remoteTasks);
                }
                setSyncMessage(null);
            } catch {
                setSyncMessage('Care plan is available offline. Changes will stay on this device until the server is reachable.');
            } finally {
                setLoading(false);
            }
        };

        fetchCarePlan();
    }, [user?.id]);

    const completed = tasks.filter(task => task.done).length;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    const nextTask = useMemo(() => tasks.find(task => !task.done), [tasks]);

    const addTask = async () => {
        const title = newTask.trim();
        if (!title) return;
        const optimisticTask: CareTask = {
            id: `${Date.now()}`,
            title,
            category: newCategory,
            time: newTime || 'Anytime',
            done: false,
        };
        setTasks(current => [...current, optimisticTask]);
        setNewTask('');

        if (!user?.id) return;
        try {
            const res = await api.post(`/care-plan/patient/${user.id}`, optimisticTask);
            const saved = res.data?.data as CareTask | undefined;
            if (saved?.id) {
                setTasks(current => current.map(task => task.id === optimisticTask.id ? saved : task));
            }
            setSyncMessage(null);
        } catch {
            setSyncMessage('Task saved locally. The server could not sync it yet.');
        }
    };

    const toggleTask = async (task: CareTask) => {
        setTasks(current => current.map(item => item.id === task.id ? { ...item, done: !item.done } : item));
        if (typeof task.id !== 'number') return;
        try {
            const res = await api.patch(`/care-plan/tasks/${task.id}/toggle`);
            const saved = res.data?.data as CareTask | undefined;
            if (saved?.id) {
                setTasks(current => current.map(item => item.id === task.id ? saved : item));
            }
            setSyncMessage(null);
        } catch {
            setSyncMessage('Status changed locally. The server could not sync it yet.');
        }
    };

    const deleteTask = async (task: CareTask) => {
        setTasks(current => current.filter(item => item.id !== task.id));
        if (typeof task.id !== 'number') return;
        try {
            await api.delete(`/care-plan/tasks/${task.id}`);
            setSyncMessage(null);
        } catch {
            setSyncMessage('Task removed locally. The server could not sync it yet.');
        }
    };

    return (
        <PatientPageFrame size="lg">
            <PatientPageHeader
                title="Care Plan"
                description="Track daily health tasks, medication reminders, monitoring routines, and recovery habits in one simple checklist."
                icon={ClipboardList}
                tone="teal"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Today Progress" value={`${progress}%`} icon={CheckCircle2} tone="emerald" helper={`${completed} of ${tasks.length} complete`} />
                <PatientStatCard label="Open Tasks" value={tasks.length - completed} icon={ClipboardList} tone="blue" helper="Remaining today" />
                <PatientStatCard label="Next Step" value={nextTask?.time || 'Done'} icon={CalendarCheck} tone="amber" helper={nextTask?.title || 'Care plan complete'} />
            </div>

            {syncMessage && (
                <PatientAlert icon={ClipboardList} tone="amber">{syncMessage}</PatientAlert>
            )}

            <div className={`${patientCardClass} p-5`}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <input
                        value={newTask}
                        onChange={(event) => setNewTask(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') addTask();
                        }}
                        placeholder="Add a care task"
                        className="h-10 flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    />
                    <select
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value as CareTask['category'])}
                        className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm font-semibold text-[var(--text-color)] outline-none"
                    >
                        {Object.keys(categoryIcons).map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <input
                        value={newTime}
                        onChange={(event) => setNewTime(event.target.value)}
                        type="time"
                        className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)] outline-none"
                    />
                    <Button onClick={addTask} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </div>

                {loading ? (
                    <PatientLoader label="Loading care plan" />
                ) : tasks.length === 0 ? (
                    <PatientEmptyState
                        icon={ClipboardList}
                        title="No care tasks"
                        description="Add your first reminder to start building a daily care routine."
                    />
                ) : (
                    <div className="space-y-3">
                        {tasks.map(task => {
                            const Icon = categoryIcons[task.category];
                            return (
                                <div
                                    key={task.id}
                                    className={`flex flex-col gap-3 rounded-lg border p-4 transition sm:flex-row sm:items-center sm:justify-between ${task.done ? 'border-emerald-100 bg-emerald-50/60' : 'border-[var(--border-color)] bg-[var(--card-bg)]'}`}
                                >
                                    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={() => toggleTask(task)}
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="min-w-0">
                                            <span className={`block text-sm font-bold ${task.done ? 'text-emerald-700 line-through' : 'text-[var(--text-color)]'}`}>{task.title}</span>
                                            <span className="mt-1 block text-xs text-[var(--text-muted)]">{task.time}</span>
                                        </span>
                                    </label>
                                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${categoryStyles[task.category]}`}>
                                            <Icon className="h-3.5 w-3.5" />
                                            {task.category}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task)}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                                            title="Remove task"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PatientPageFrame>
    );
};

export default CarePlan;
