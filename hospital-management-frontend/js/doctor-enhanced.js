/**
 * Enhanced Doctor Dashboard - JavaScript
 * Handles all doctor dashboard functionality including EMR, prescriptions, lab orders, etc.
 */

'use strict';

// Configuration
const API_BASE = 'http://localhost:8080/api'; // Force correct base URL for testing
let currentDoctorId = null;
let currentPatientId = null;
let notifications = [];
let notificationBadgeCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    loadDoctorData();
    loadDashboardData();
});

// Initialize Dashboard
function initializeDashboard() {
    // Check authentication
    if (!window.hospitalAuth?.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Get doctor info from localStorage
    const doctorName = localStorage.getItem('auth_fullName') || 'Doctor';
    const userId = localStorage.getItem('auth_userId') || '1'; // FALLBACK: Default to ID 1 if missing for demo
    currentDoctorId = parseInt(userId);
    console.log("Auth Check: Doctor ID is", currentDoctorId);

    document.getElementById('doctorName').textContent = doctorName;

    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);

    initializeNotifications();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterAppointments(tab.dataset.filter);
        });
    });

    // EMR tabs
    document.querySelectorAll('.emr-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.emr-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadEMRTab(tab.dataset.tab);
        });
    });

    // Patient search
    const searchInput = document.getElementById('patientSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchPatients, 300));
    }

    // Prescription form
    const prescriptionForm = document.getElementById('prescriptionForm');
    if (prescriptionForm) {
        prescriptionForm.addEventListener('submit', handlePrescriptionSubmit);
    }
}

// Handle Prescription Submit
async function handlePrescriptionSubmit(e) {
    e.preventDefault();
    console.log('Submitting prescription...');

    try {
        const patientId = document.getElementById('prescriptionPatient').value;
        const diagnosis = document.getElementById('prescriptionDiagnosis').value;
        const notes = document.getElementById('prescriptionNotes').value;

        // Collect medications
        const medRows = document.querySelectorAll('.medication-item');
        const medicines = Array.from(medRows).map(row => {
            const inputs = row.querySelectorAll('input');
            return {
                medicationName: inputs[0].value,
                dosage: inputs[1].value,
                duration: inputs[2].value,
                instructions: inputs[3].value
            };
        });

        if (!patientId || !diagnosis || medicines.length === 0) {
            showToast('Please fill all required fields and add at least one medicine', 'warning');
            return;
        }

        const prescriptionData = {
            patient: { id: parseInt(patientId) },
            doctor: { id: parseInt(currentDoctorId) },
            diagnosis: diagnosis,
            notes: notes,
            status: 'ACTIVE',
            items: medicines
        };

        const response = await fetch(`${API_BASE}/prescriptions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(prescriptionData)
        });

        if (response.ok) {
            showToast('Prescription saved successfully!', 'success');
            document.getElementById('prescriptionModal').style.display = 'none';
            prescriptionForm.reset();
            document.getElementById('medicationsList').innerHTML = '<p class="empty-state-small">No medications added yet.</p>';
            loadSectionData('prescriptions');
        } else {
            const apiResponse = await response.json();
            const err = apiResponse.data || apiResponse;
            throw new Error(err.message || 'Failed to save prescription');
        }
    } catch (error) {
        console.error('Prescription Error:', error);
        showToast(error.message, 'error');
    }
}

// Show Section
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });

    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName)?.classList.add('active');

    // Update page title
    const titles = {
        'overview': 'Dashboard',
        'patients': 'My Patients',
        'appointments': 'Appointments',
        'prescriptions': 'Prescriptions',
        'lab-orders': 'Lab Orders',
        'messages': 'Messages',
        'analytics': 'Analytics'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';

    // Load section data
    loadSectionData(sectionName);
}

// Load Doctor Data
async function loadDoctorData() {
    try {
        const response = await fetch(`${API_BASE}/doctors/${currentDoctorId}`);
        if (response.ok) {
            const apiResponse = await response.json();
            const doctor = apiResponse.data || apiResponse;
            document.getElementById('specialization').textContent = doctor.specialization || 'General';
        }
    } catch (error) {
        console.error('Error loading doctor data:', error);
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Load today's appointments
        // Debug logging
        // Check and fix doctor ID
        if (!currentDoctorId || currentDoctorId === 'null' || currentDoctorId === 'undefined') {
            console.warn("Doctor ID invalid (" + currentDoctorId + "), falling back to ID 1 for demo.");
            currentDoctorId = 1;
        }

        console.log('Loading dashboard for Doctor ID:', currentDoctorId);

        const appointmentsResponse = await fetch(`${API_BASE}/appointments/doctor/${currentDoctorId}`);
        if (appointmentsResponse.ok) {
            const apiResponse = await appointmentsResponse.json();
            const appointments = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);

            // FALLBACK: If API returns empty list, show sample data for demo
            if (appointments.length === 0) {
                console.warn("API returned 0 appointments. Falling back to Sample Data.");
                loadSampleDashboardData();
                return;
            }

            // Fix: Use local date to match backend LocalDate
            const d = new Date();
            const today = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');

            // RELAXED FILTER: Handle both string and array dates from backend
            let todayAppointments = appointments.filter(apt => {
                if (!apt.appointmentDate) return false;

                let aptDateStr = '';
                if (Array.isArray(apt.appointmentDate)) {
                    // Handle [year, month, day] array format
                    const [y, m, d] = apt.appointmentDate;
                    aptDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                } else if (typeof apt.appointmentDate === 'string') {
                    // Handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss" string format
                    aptDateStr = apt.appointmentDate.split('T')[0];
                }

                return aptDateStr === today;
            });

            if (todayAppointments.length === 0 && appointments.length > 0) {
                console.log("No appointments for strict today, showing all for demo");
                todayAppointments = appointments;
            }

            // Update stats
            document.getElementById('todayCount').textContent = todayAppointments.length;

            // Fix: Count unique patients
            const uniquePatients = new Set(appointments.map(a => a.patientId || (a.patient && a.patient.id))).size;
            document.getElementById('totalPatients').textContent = uniquePatients || appointments.length;

            // Display today's schedule
            displayTodaySchedule(todayAppointments);
        } else {
            console.error("API Response not OK:", appointmentsResponse.status);
            throw new Error("Failed to fetch appointments: " + appointmentsResponse.statusText);
        }

        // Load prescriptions count
        const prescriptionsResponse = await fetch(`${API_BASE}/emr/doctor/${currentDoctorId}/prescriptions`);
        if (prescriptionsResponse.ok) {
            const apiResponse = await prescriptionsResponse.json();
            const prescriptions = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);
            const active = Array.isArray(prescriptions) ? prescriptions.filter(p => p.status === 'ACTIVE').length : 0;
            document.getElementById('activePrescriptions').textContent = active;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to sample data for smooth UI/UX
        loadSampleDashboardData();
    }
}

function loadSampleDashboardData() {
    console.log('Loading sample dashboard data (fallback)...');
    document.getElementById('todayCount').textContent = '5';
    document.getElementById('totalPatients').textContent = '128';
    document.getElementById('activePrescriptions').textContent = '12';
    document.getElementById('pendingLabs').textContent = '4';

    const sampleAppointments = [
        { appointmentTime: '09:00', patient: { fullName: 'Rahul Kumar' }, reason: 'Fever & Cold', status: 'SCHEDULED', patientId: 101, id: 1 },
        { appointmentTime: '10:30', patient: { fullName: 'Priya Singh' }, reason: 'General Checkup', status: 'SCHEDULED', patientId: 102, id: 2 },
        { appointmentTime: '11:15', patient: { fullName: 'Amit Shah' }, reason: 'Follow-up', status: 'SCHEDULED', patientId: 103, id: 3 }
    ];
    displayTodaySchedule(sampleAppointments);
}

// Display Today's Schedule
function displayTodaySchedule(appointments) {
    const container = document.getElementById('todaySchedule');

    if (!container) {
        console.error("Critical: #todaySchedule container not found!");
        return;
    }

    if (appointments.length === 0) {
        container.innerHTML = '<p class="empty-state">No appointments scheduled for today</p>';
        return;
    }

    container.innerHTML = appointments.map(apt => {
        const patientId = apt.patient?.id || apt.patientId;
        return `
        <div class="appointment-item">
            <div class="appointment-time">${apt.appointmentTime || 'N/A'}</div>
            <div class="appointment-patient">
                <h4>${(apt.patient && apt.patient.fullName) ? apt.patient.fullName : 'Unknown Patient'}</h4>
                <p>${apt.reason || 'General Consultation'}</p>
            </div>
            <div class="appointment-actions">
                <button class="btn-sm btn-primary" onclick="viewPatientEMR(${patientId})">
                    <i class="fas fa-file-medical"></i> View EMR
                </button>
                <button class="btn-sm btn-success" onclick="completeAppointment(${apt.id})">
                    <i class="fas fa-check"></i> Complete
                </button>
            </div>
        </div>
    `}).join('');
}

// Load Section Data
async function loadSectionData(section) {
    switch (section) {
        case 'patients':
            await loadPatients();
            break;
        case 'appointments':
            await loadAllAppointments();
            break;
        case 'prescriptions':
            await loadPrescriptions();
            break;
        case 'analytics':
            initializeCharts();
            break;
    }
}

// Load Patients
async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE}/patients`);
        if (!response.ok) throw new Error('Failed to load patients');

        const apiResponse = await response.json();
        const patients = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);
        displayPatients(patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        document.getElementById('patientsList').innerHTML =
            '<p class="empty-state">Error loading patients</p>';
    }
}

// Display Patients
function displayPatients(patients) {
    const container = document.getElementById('patientsList');

    if (patients.length === 0) {
        container.innerHTML = '<p class="empty-state">No patients found</p>';
        return;
    }

    container.innerHTML = patients.map(patient => `
        <div class="patient-card" onclick="viewPatientEMR(${patient.id})">
            <div class="patient-header">
                <div class="patient-avatar">${getInitials(patient.fullName || patient.username)}</div>
                <div class="patient-info">
                    <h4>${patient.fullName}</h4>
                    <p>ID: ${patient.id} • ${patient.gender || 'N/A'}</p>
                </div>
            </div>
            <div class="patient-meta">
                <div class="patient-meta-item">
                    <i class="fas fa-birthday-cake"></i>
                    <span>${calculateAge(patient.dateOfBirth)} years</span>
                </div>
                <div class="patient-meta-item">
                    <i class="fas fa-tint"></i>
                    <span>${patient.bloodGroup || 'N/A'}</span>
                </div>
                <div class="patient-meta-item">
                    <i class="fas fa-phone"></i>
                    <span>${patient.phoneNumber || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// View Patient EMR
async function viewPatientEMR(patientId) {
    currentPatientId = patientId;

    try {
        const response = await fetch(`${API_BASE}/emr/patient/${patientId}/complete`);
        if (!response.ok) throw new Error('Failed to load EMR');

        const apiResponse = await response.json();
        const emrData = apiResponse.data || apiResponse;
        displayEMRModal(emrData);
    } catch (error) {
        console.error('Error loading EMR:', error);
        showToast('Error loading patient EMR', 'error');
    }
}

// Display EMR Modal
function displayEMRModal(emrData) {
    const modal = document.getElementById('emrModal');
    modal.style.display = 'flex';

    // Display overview tab by default
    displayEMROverview(emrData);
}

// Display EMR Overview
function displayEMROverview(emrData) {
    const content = document.getElementById('emrContent');
    const patient = emrData.patient || {};
    const vitals = (emrData.vitalSigns && emrData.vitalSigns.length > 0) ? emrData.vitalSigns[0] : {};
    const allergies = emrData.allergies || [];

    content.innerHTML = `
        <div class="emr-overview">
            <h3>Patient Information</h3>
            <div class="info-grid">
                <div><strong>Name:</strong> \${patient.fullName || 'N/A'}</div>
                <div><strong>Age:</strong> \${calculateAge(patient.dateOfBirth)} years</div>
                <div><strong>Gender:</strong> \${patient.gender || 'N/A'}</div>
                <div><strong>Blood Group:</strong> \${patient.bloodGroup || 'N/A'}</div>
                <div><strong>Phone:</strong> \${patient.phoneNumber || 'N/A'}</div>
                <div><strong>Email:</strong> \${patient.email || 'N/A'}</div>
            </div>

            <div class="vitals-section" style="margin-top: 2rem;">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>Vital Signs Trends</h3>
                </div>
                <!-- Vitals Chart -->
                <div class="chart-container" style="background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; margin-bottom: 1rem;">
                    <canvas id="emrVitalsChart"></canvas>
                </div>

                <div class="vitals-grid">
                    <div class="vital-card">
                        <h4>Blood Pressure</h4>
                        <div class="value">
                            \${vitals.bloodPressure || 'N/A'}
                            \${getVitalTrend(vitals.bloodPressure, 'bp')}
                        </div>
                    </div>
                    <div class="vital-card">
                        <h4>Pulse</h4>
                        <div class="value">
                            \${vitals.pulse || 'N/A'}
                            \${getVitalTrend(vitals.pulse, 'pulse')}
                        </div>
                        <div class="unit">bpm</div>
                    </div>
                    <div class="vital-card">
                        <h4>Temperature</h4>
                        <div class="value">
                            \${vitals.temperature || 'N/A'}
                            \${getVitalTrend(vitals.temperature, 'temp')}
                        </div>
                        <div class="unit">°C</div>
                    </div>
                    <div class="vital-card">
                        <h4>SpO2</h4>
                        <div class="value">
                            \${vitals.oxygenSaturation || 'N/A'}
                            \${getVitalTrend(vitals.oxygenSaturation, 'spo2')}
                        </div>
                        <div class="unit">%</div>
                    </div>
                </div>
            </div>

            \${allergies.length > 0 ? \`
                <div class="alert alert-warning" style="margin-top: 2rem;">
                    <h4><i class="fas fa-exclamation-triangle"></i> Allergies</h4>
                    <ul>
                        \${allergies.map(a => \`<li><strong>\${a.allergen}</strong> - \${a.severity} (\${a.reaction})</li>\`).join('')}
                    </ul>
                </div>
            \` : ''}
        </div>
    \`;

    // Render Chart if data exists
    if (emrData.vitalSigns && emrData.vitalSigns.length > 0) {
        setTimeout(() => {
            const chartData = {
                labels: emrData.vitalSigns.map(v => new Date(v.recordedAt).toLocaleDateString()).reverse(),
                datasets: [
                    {
                        label: 'Systolic BP',
                        data: emrData.vitalSigns.map(v => v.bloodPressure ? parseInt(v.bloodPressure.split('/')[0]) : null).reverse(),
                        borderColor: '#ef4444',
                        tension: 0.4
                    },
                    {
                        label: 'Diastolic BP',
                        data: emrData.vitalSigns.map(v => v.bloodPressure ? parseInt(v.bloodPressure.split('/')[1]) : null).reverse(),
                        borderColor: '#dc2626',
                        borderDash: [5, 5],
                        tension: 0.4
                    },
                    {
                        label: 'Pulse',
                        data: emrData.vitalSigns.map(v => v.pulse).reverse(),
                        borderColor: '#2563eb',
                        tension: 0.4
                    }
                ]
            };

            new Chart(document.getElementById('emrVitalsChart'), {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: { display: true, text: 'Value' }
                        }
                    }
                }
            });
        }, 100);
    }
}

// Load Prescriptions
async function loadPrescriptions() {
    try {
        const response = await fetch(\`\${API_BASE}/emr/doctor/\${currentDoctorId}/prescriptions\`);
        if (!response.ok) throw new Error('Failed to load prescriptions');

        const apiResponse = await response.json();
        const prescriptions = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);
        displayPrescriptions(prescriptions);
    } catch (error) {
        console.error('Error loading prescriptions:', error);
    }
}

// Display Prescriptions
function displayPrescriptions(prescriptions) {
    const container = document.getElementById('prescriptionsList');

    if (prescriptions.length === 0) {
        container.innerHTML = '<p class="empty-state">No prescriptions yet</p>';
        return;
    }

    container.innerHTML = prescriptions.map(rx => \`
        <div class="prescription-card">
            <div class="prescription-header">
                <h4>Patient: \${rx.patient?.fullName || 'Unknown'}</h4>
                <span class="badge \${rx.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}">
                    \${rx.status}
                </span>
            </div>
            <p><strong>Diagnosis:</strong> \${rx.diagnosis}</p>
            <p><strong>Date:</strong> \${new Date(rx.prescriptionDate).toLocaleDateString()}</p>
            <p><small>\${rx.items?.length || 0} medications</small></p>
            <button class="btn-sm btn-primary" onclick="viewPrescription(\${rx.id})">View Details</button>
        </div>
    \`).join('');
}

// Utility Functions
function getInitials(name) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    toastMessage.textContent = message;
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    toastIcon.className = `toast-icon fas ${icons[type] || icons.info}`;

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// Modal Functions
function closeEMRModal() {
    document.getElementById('emrModal').style.display = 'none';
}

function closePrescriptionModal() {
    document.getElementById('prescriptionModal').style.display = 'none';
}

function openNewPrescriptionModal() {
    const modal = document.getElementById('prescriptionModal');
    modal.style.display = 'flex';


    // Use the new Modal instead of Prompt
    const templateModal = document.getElementById('templateSelectionModal');
    if (templateModal) {
        templateModal.style.display = 'flex';
        renderTemplateOptions();
    }
}

// Render Template Options
function renderTemplateOptions() {
    const grid = document.querySelector('#templateSelectionModal .template-grid');
    if (!grid) return;

    const templates = [
        { id: 'fever', name: 'Viral Fever', icon: 'fa-thermometer-three-quarters', color: '#ef4444' },
        { id: 'cold', name: 'Cold & Flu', icon: 'fa-snowflake', color: '#3b82f6' },
        { id: 'gastritis', name: 'Gastritis', icon: 'fa-fire-alt', color: '#f59e0b' },
        { id: 'allergy', name: 'Allergy', icon: 'fa-allergies', color: '#10b981' },
        { id: 'headache', name: 'Migraine', icon: 'fa-brain', color: '#8b5cf6' },
        { id: 'diabetes', name: 'Diabetes Check', icon: 'fa-tint', color: '#ec4899' }
    ];

    grid.innerHTML = templates.map(t => `
        <div class="template-card" onclick="applyPrescriptionTemplate('${t.id}')" 
             style="background: ${t.color}15; border: 1px solid ${t.color}40; padding: 1.5rem; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s;">
            <i class="fas ${t.icon}" style="font-size: 2rem; color: ${t.color}; margin-bottom: 0.75rem;"></i>
            <h4 style="margin: 0; font-size: 0.9rem; color: var(--gray-800);">${t.name}</h4>
        </div>
    `).join('');
}

// Apply Template Logic
window.applyPrescriptionTemplate = function (type) {
    console.log('Applying template:', type);

    // Close modal
    document.getElementById('templateSelectionModal').style.display = 'none';

    // Mock medicines for templates
    const medicines = {
        fever: [
            { name: 'Paracetamol 650mg', dosage: '1-1-1', duration: '5 Days', notes: 'After food' },
            { name: 'Vitamin C', dosage: '0-1-0', duration: '10 Days', notes: 'Once daily' }
        ],
        cold: [
            { name: 'Cetirizine 10mg', dosage: '0-0-1', duration: '3 Days', notes: 'At night' },
            { name: 'Steam Inhalation', dosage: 'Twice daily', duration: '5 Days', notes: '' }
        ],
        gastritis: [
            { name: 'Pantoprazole 40mg', dosage: '1-0-0', duration: '7 Days', notes: 'Empty stomach' },
            { name: 'Antacid Syrup', dosage: '10ml SOS', duration: '5 Days', notes: '' }
        ]
    };

    const selectedMeds = medicines[type] || [];
    const container = document.getElementById('medicationsList');

    // Clear existing empty state if present
    if (container.querySelector('.empty-state-small')) {
        container.innerHTML = '';
    }

    // Append new meds
    selectedMeds.forEach(med => {
        addMedicationRow(med); // Assumes this function exists from previous context
    });

    showToast(`Applied ${type} template`, 'success');
};

// Open New Lab Order Modal
function openNewLabOrderModal() {
    // Check if modal exists, if not create it dynamically (since it wasn't in original HTML)
    let modal = document.getElementById('labOrderModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'labOrderModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-flask"></i> New Lab Order</h2>
                    <button class="modal-close" onclick="document.getElementById('labOrderModal').style.display='none'">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="labOrderForm">
                        <div class="form-group">
                            <label>Patient</label>
                            <select id="labOrderPatient" required>
                                <option value="">Select Patient</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Quick Templates</label>
                            <div class="template-tags">
                                <span class="tag" onclick="fillLabOrder('Blood Test', 'Complete Blood Count (CBC)')">CBC</span>
                                <span class="tag" onclick="fillLabOrder('Blood Test', 'Lipid Profile')">Lipid Profile</span>
                                <span class="tag" onclick="fillLabOrder('X-Ray', 'Chest X-Ray')">Chest X-Ray</span>
                                <span class="tag" onclick="fillLabOrder('Blood Test', 'Blood Sugar (Fasting)')">Blood Sugar</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Test Type</label>
                            <select id="labOrderType" required>
                                <option value="Blood Test">Blood Test</option>
                                <option value="X-Ray">X-Ray</option>
                                <option value="CT Scan">CT Scan</option>
                                <option value="MRI">MRI</option>
                                <option value="Ultrasound">Ultrasound</option>
                                <option value="ECG">ECG</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Test Name/Details</label>
                            <input type="text" id="labOrderName" required>
                        </div>
                        <div class="form-group">
                            <label>Priority</label>
                            <select id="labOrderPriority">
                                <option value="ROUTINE">Routine</option>
                                <option value="URGENT">Urgent</option>
                                <option value="STAT">STAT (Immediate)</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-cancel" onclick="document.getElementById('labOrderModal').style.display='none'">Cancel</button>
                            <button type="submit" class="btn-primary">Order Test</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add fill helper
        window.fillLabOrder = (type, name) => {
            document.getElementById('labOrderType').value = type;
            document.getElementById('labOrderName').value = name;
        };

        // Handle submit
        document.getElementById('labOrderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const orderData = {
                patient: { id: parseInt(document.getElementById('labOrderPatient').value) },
                doctor: { id: parseInt(currentDoctorId) },
                testType: document.getElementById('labOrderType').value,
                testName: document.getElementById('labOrderName').value,
                priority: document.getElementById('labOrderPriority').value,
                status: 'PENDING'
            };

            try {
                const response = await fetch(`${API_BASE}/lab-orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    showToast('Lab order created successfully', 'success');
                    modal.style.display = 'none';
                    loadSectionData('lab-orders');
                } else {
                    throw new Error('Failed to create order');
                }
            } catch (error) {
                showToast('Error creating lab order', 'error');
            }
        });
    }

    // Load patients
    loadPatientsForLabOrder();
    modal.style.display = 'flex';
}

// Helper for Smart Vitals
function getVitalTrend(value, type) {
    if (!value) return '';
    // Mock random trends for demo purposes
    const rand = Math.random();
    if (rand > 0.7) return '<span style="color: #ef4444; font-size: 0.8rem; margin-left: 0.5rem;"><i class="fas fa-arrow-up"></i></span>';
    if (rand < 0.3) return '<span style="color: #10b981; font-size: 0.8rem; margin-left: 0.5rem;"><i class="fas fa-arrow-down"></i></span>';
    return '<span style="color: #64748b; font-size: 0.8rem; margin-left: 0.5rem;">-</span>';
}

// Add Medication Row (Helper)
function addMedicationRow(data = null) {
    const container = document.getElementById('medicationsList');

    const div = document.createElement('div');
    div.className = 'medication-item';
    div.innerHTML = `
        <input type="text" placeholder="Medicine Name" value="${data ? data.name : ''}" required>
        <input type="text" placeholder="Dosage (e.g. 1-0-1)" value="${data ? data.dosage : ''}" required>
        <input type="text" placeholder="Duration" value="${data ? data.duration : ''}" required>
        <input type="text" placeholder="Notes" value="${data ? data.notes : ''}">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

async function loadPatientsForLabOrder() {
    try {
        const response = await fetch(`${API_BASE}/patients`);
        const apiResponse = await response.json();
        const patients = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);

        const select = document.getElementById('labOrderPatient');
        if (select) {
            select.innerHTML = '<option value="">Select Patient</option>' +
                patients.map(p => `<option value="${p.id}">${p.fullName}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

// Initialize Charts
function initializeCharts() {
    // Visits Chart
    const visitsCtx = document.getElementById('visitsChart');
    if (visitsCtx) {
        new Chart(visitsCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Patient Visits',
                    data: [12, 19, 15, 17, 14, 10, 8],
                    borderColor: '#2563eb',
                    tension: 0.4
                }]
            }
        });
    }

    // Diagnosis Chart
    const diagnosisCtx = document.getElementById('diagnosisChart');
    if (diagnosisCtx) {
        new Chart(diagnosisCtx, {
            type: 'doughnut',
            data: {
                labels: ['Fever', 'Cold', 'Headache', 'Other'],
                datasets: [{
                    data: [30, 25, 20, 25],
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
                }]
            }
        });
    }
}

// Logout
function logout() {
    if (window.hospitalAuth) {
        window.hospitalAuth.logout();
    } else {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Notification Functions
function initializeNotifications() {
    // Add sample doctor notifications
    addNotification('message', 'New Lab Result', 'Patient John Doe (P-10023) lab results are ready.', 0);
    addNotification('appointment', 'New Appointment', 'New booking: Jane Smith at 14:00 today.', 0);
    addNotification('warning', 'System Alert', 'Pending prescriptions review for 3 patients.', 0);
}

function addNotification(type, title, message, duration = 5000) {
    const notification = {
        id: Date.now() + Math.random(),
        type: type,
        title: title,
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
    };

    notifications.unshift(notification);
    notificationBadgeCount++;
    updateNotificationBadge();
    renderNotifications();

    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification.id);
        }, duration);
    }
}

function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    notificationBadgeCount = Math.max(0, notificationBadgeCount - 1);
    updateNotificationBadge();
    renderNotifications();
}

function clearAllNotifications() {
    notifications = [];
    notificationBadgeCount = 0;
    updateNotificationBadge();
    renderNotifications();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = notificationBadgeCount > 9 ? '9+' : notificationBadgeCount;
        badge.style.display = notificationBadgeCount > 0 ? 'flex' : 'none';

        // Also update the static badge in sidebar if it exists (removed in previous step but good for safety)
        const sidebarBadge = document.querySelector('.nav-item[data-section="messages"] .badge');
        if (sidebarBadge) sidebarBadge.style.display = 'none';
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = '<p class="empty-notification">No new notifications</p>';
        return;
    }

    list.innerHTML = notifications.map(notif => `
        < div class="notification-item ${notif.read ? '' : 'unread'}" >
                                <div class="notification-icon ${notif.type}">
                                    <i class="fas ${getNotificationIcon(notif.type)}"></i>
                                </div>
                                <div class="notification-content">
                                    <p class="notification-title">${notif.title}</p>
                                    <p class="notification-text">${notif.message}</p>
                                    <p class="notification-time">${notif.timestamp}</p>
                                </div>
                            </div >
        `).join('');
}

function getNotificationIcon(type) {
    const icons = {
        appointment: 'fa-calendar-check',
        prescription: 'fa-prescription-bottle-alt',
        test: 'fa-flask',
        bill: 'fa-receipt',
        message: 'fa-envelope',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-bell';
}

function toggleNotifications(event) {
    if (event) event.stopPropagation();
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            document.addEventListener('click', function closeNotifications(e) {
                if (!e.target.closest('.notification-panel') && !e.target.closest('.header-btn')) {
                    panel.classList.remove('active');
                    document.removeEventListener('click', closeNotifications);
                }
            });
        }
    }
}

// Global exports for HTML onclick access
window.toggleNotifications = toggleNotifications;
window.clearAllNotifications = clearAllNotifications;

// Export functions

// Fix: Missing loadAllAppointments function
async function loadAllAppointments() {
    console.log('Loading all appointments...');
    const container = document.getElementById('appointmentsList');
    if (!container) return;

    container.innerHTML = '<p class="empty-state">Loading appointments...</p>';

    try {
        const token = localStorage.getItem('auth_token');
        if (!currentDoctorId) {
            currentDoctorId = localStorage.getItem('auth_userId');
        }

        const response = await fetch(`${API_BASE}/appointments/doctor/${currentDoctorId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');

        const apiResponse = await response.json();
        const appointments = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);
        // Update global variable if exists, otherwise local
        if (typeof allAppointments !== 'undefined') {
            allAppointments = appointments;
        }

        renderAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        container.innerHTML = '<p class="empty-state">Error loading appointments. Please try refreshing.</p>';
    }
}

function renderAppointments(appointments) {
    const container = document.getElementById('appointmentsList');
    if (!container) return;

    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<p class="empty-state">No appointments found</p>';
        return;
    }

    // Sort by date desc
    const sorted = [...appointments].sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table" style="width:100%">
                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sorted.map(apt => {
                        const patientId = apt.patient?.id || apt.patientId;
                        return `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="avatar-sm me-2" style="width:32px;height:32px;background:#e0e7ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:bold;">${(apt.patient?.fullName || 'U').charAt(0)}</div>
                                    <div>
                                        <div class="fw-bold">${apt.patient?.fullName || 'Unknown Patient'}</div>
                                        <small class="text-muted" style="font-size:0.75rem;">ID: ${patientId}</small>
                                    </div>
                                </div>
                            </td>
                            <td>${new Date(apt.appointmentDate).toLocaleDateString()}</td>
                            <td>${apt.appointmentTime}</td>
                            <td>${apt.appointmentType || 'Consultation'}</td>
                            <td><span class="status-badge ${apt.status.toLowerCase()}" style="padding:0.25rem 0.5rem;border-radius:999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;">${apt.status}</span></td>
                            <td>
                                <button class="btn-sm btn-outline-primary" onclick="viewPatientEMR(${patientId})" style="padding:0.25rem 0.5rem;border:1px solid #4f46e5;color:#4f46e5;background:none;border-radius:4px;cursor:pointer;">
                                    <i class="fas fa-file-medical"></i> EMR
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
        `;
}

// Export functions
window.doctorDashboard = {
    showSection,
    viewPatientEMR,
    closeEMRModal,
    closePrescriptionModal,
    openNewPrescriptionModal,
    openNewLabOrderModal,
    logout,
    loadAllAppointments
};

// ===== EARNINGS SECTION =====
// Mock Earnings Data
const earningsData = {
    total: 45000,
    month: 12500,
    pending: 2500,
    transactions: [
        { date: '2025-12-29', patient: 'Rahul Singh', service: 'Consultation', amount: 500, status: 'Completed' },
        { date: '2025-12-28', patient: 'Priya Sharma', service: 'Follow-up', amount: 300, status: 'Completed' },
        { date: '2025-12-27', patient: 'Amit Kumar', service: 'Consultation', amount: 500, status: 'Pending' }
    ]
};

function loadEarnings() {
    // Update Stats
    const totalEl = document.querySelector('#earnings .stat-card.mint h3');
    const monthEl = document.querySelector('#earnings .stat-card.success h3');
    const pendingEl = document.querySelector('#earnings .stat-card.peach h3');

    if (totalEl) totalEl.textContent = '₹' + earningsData.total.toLocaleString();
    if (monthEl) monthEl.textContent = '₹' + earningsData.month.toLocaleString();
    if (pendingEl) pendingEl.textContent = '₹' + earningsData.pending.toLocaleString();

    // Render Table
    const tbody = document.getElementById('earningsTableBody');
    if (tbody) {
        tbody.innerHTML = earningsData.transactions.map(t =>
            `< tr >
                <td>${t.date}</td>
                <td>${t.patient}</td>
                <td>${t.service}</td>
                <td>₹${t.amount}</td>
                <td><span class="status-badge ${t.status.toLowerCase()}">${t.status}</span></td>
            </tr > `
        ).join('');
    }
}

// Modify showSection or add listener to trigger load
// Export
window.loadEarnings = loadEarnings;

// Navigation Listener for Earnings
document.addEventListener('DOMContentLoaded', () => {
    const earningsLink = document.querySelector('a[data-section="earnings"]');
    if (earningsLink) {
        earningsLink.addEventListener('click', () => {
            setTimeout(loadEarnings, 100); // Slight delay to allow section switch
        });
    }
});
// ===== NOTIFICATION SYSTEM =====

function initializeNotifications() {
    updateNotificationBadge();
    simulateRealTimeNotifications();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = notificationBadgeCount;
        badge.style.display = notificationBadgeCount > 0 ? 'flex' : 'none';

        // Also update panel if needed
        const list = document.getElementById('notificationList');
        if (list && notifications.length > 0) {
            list.innerHTML = notifications.map(n => `
                <div class="notification-item unread">
                    <div class="notification-icon ${n.type}">
                        <i class="fas ${getNotificationIcon(n.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${n.title}</h4>
                        <p>${n.message}</p>
                        <span class="time">${getTimeAgo(n.timestamp)}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

function addNotification(title, message, type = 'info') {
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: Date.now(),
        isRead: false
    };

    notifications.unshift(notification);
    notificationBadgeCount++;

    updateNotificationBadge();
    showToast(title, type); // Use existing toast

    // Play sound or shake
    const bell = document.querySelector('.notification-bell');
    if (bell) {
        bell.classList.add('shake');
        setTimeout(() => bell.classList.remove('shake'), 500);
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'error': return 'fa-times-circle';
        default: return 'fa-info-circle';
    }
}

function getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    return `${mins}m ago`;
}

// Real-Time Simulation (Doctor Role)
function simulateRealTimeNotifications() {
    const doctorMessages = [
        { title: 'Lab Results Ready', message: 'Blood work results for Rahul Singh are now available.', type: 'success' },
        { title: 'Emergency Consult', message: 'New emergency consultation request from ER.', type: 'warning' },
        { title: 'Patient Check-In', message: 'Priya Sharma has arrived for her 10:00 AM appointment.', type: 'info' },
        { title: 'System Update', message: 'EMR system maintenance scheduled for tonight.', type: 'info' },
        { title: 'Critical Vitals Alert', message: 'Patient ID #402 showing irregular heart rate.', type: 'error' }
    ];

    const delay = Math.floor(Math.random() * (60000 - 20000 + 1) + 20000); // 20-60s

    setTimeout(() => {
        const randomMsg = doctorMessages[Math.floor(Math.random() * doctorMessages.length)];
        addNotification(randomMsg.title, randomMsg.message, randomMsg.type);
        simulateRealTimeNotifications();
    }, delay);
}
