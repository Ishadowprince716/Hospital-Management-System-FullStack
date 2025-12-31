// Doctor Dashboard JS

const API_BASE_URL = 'http://localhost:8080/api';
let currentUser = null;
let appointments = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupNavigation();
    initDashboard();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user'); // Enhanced user object

    if (!token || !userStr) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(userStr);

    if (currentUser.role !== 'DOCTOR') {
        window.location.href = 'index.html'; // Or patient-dashboard.html
        return;
    }

    // Update Header
    document.getElementById('doctorName').innerText = `Dr. ${currentUser.fullName || currentUser.username}`;
    // Fetch specialisation from doctor details endpoint if needed, for now placeholder
}

// Global Auth Helper for window access
window.doctorAuth = {
    logout: () => {
        localStorage.clear();
        window.location.href = 'index.html';
    },
    showToast: (msg, type) => showToast(msg, type)
};

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const sectionId = item.dataset.section;
            sections.forEach(s => {
                s.classList.toggle('active', s.id === sectionId);
            });
        });
    });
}

async function initDashboard() {
    // Set Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', dateOptions);

    await fetchAppointments();
}

async function fetchAppointments() {
    try {
        console.log('🔄 Fetching appointments for doctor ID:', currentUser.id);
        
        const token = localStorage.getItem('token');
        const appointmentsUrl = `${API_BASE_URL}/appointments/doctor/${currentUser.id}`;
        console.log('📡 API URL:', appointmentsUrl);
        console.log('🔑 Token present:', !!token);

        const response = await fetch(appointmentsUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`API Error: ${response.status} - ${errorText || 'Unknown error'}`);
        }

        appointments = await response.json();
        console.log('✅ Appointments loaded:', appointments.length, 'appointments');
        console.log('📋 Appointment details:', appointments);
        
        updateStats();
        renderAppointments();

    } catch (error) {
        console.error('❌ Error fetching appointments:', error);
        console.error('Stack trace:', error.stack);
        
        const container = document.getElementById('appointmentsList');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; background: #fee; border-radius: 5px; color: #c00;">
                    <h4>⚠️ Error Loading Appointments</h4>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p><strong>Doctor ID:</strong> ${currentUser.id}</p>
                    <p><strong>API URL:</strong> ${API_BASE_URL}/appointments/doctor/${currentUser.id}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #0099cc; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        🔄 Reload Page
                    </button>
                </div>
            `;
        }
        showToast('Could not load appointments: ' + error.message, 'error');
    }
}

function updateStats() {
    // Fix: Use local date instead of UTC to match backend LocalDate
    const d = new Date();
    const todayStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');

    const todayCount = appointments.filter(a => a.appointmentDate === todayStr).length;
    const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
    const pendingCount = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'PENDING').length;

    document.getElementById('todayCount').innerText = todayCount;
    document.getElementById('completedCount').innerText = completedCount;
    document.getElementById('pendingCount').innerText = pendingCount;
}

function renderAppointments() {
    const container = document.getElementById('appointmentsList');
    const todayContainer = document.getElementById('todaySchedule');

    if (appointments.length === 0) {
        container.innerHTML = '<p class="empty-state">No appointments found.</p>';
        todayContainer.innerHTML = '<p class="empty-state">No appointments for today.</p>';
        return;
    }

    // Fix: Use local date to match backend
    const d = new Date();
    const todayStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    const todayApps = appointments.filter(a => a.appointmentDate === todayStr);

    // Render Today's
    todayContainer.innerHTML = todayApps.length > 0
        ? createTable(todayApps)
        : '<p class="empty-state">No appointments for today.</p>';

    // Render All
    container.innerHTML = createTable(appointments);
}

function createTable(apps) {
    return `
        <table class="appointments-table">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${apps.map(app => `
                    <tr>
                        <td>
                            <div class="patient-cell">
                                <div class="avatar-sm">${(app.patient && app.patient.fullName) ? app.patient.fullName.charAt(0) : 'U'}</div>
                                <div>
                                    <p class="font-medium">${(app.patient && app.patient.fullName) ? app.patient.fullName : 'Unknown Patient'}</p>
                                    <small>${(app.patient && app.patient.age) || '--'} yrs, ${(app.patient && app.patient.gender) || ''}</small>
                                </div>
                            </div>
                        </td>
                        <td>${app.appointmentDate}</td>
                        <td>${app.appointmentTime}</td>
                        <td>${app.reason}</td>
                        <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
                        <td>
                            ${getActions(app)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getActions(app) {
    if (app.status === 'COMPLETED') return '<span class="text-success"><i class="fas fa-check"></i> Done</span>';
    if (app.status === 'CANCELLED') return '<span class="text-muted">Cancelled</span>';

    return `
        <button class="btn-icon btn-complete" onclick="updateStatus(${app.id}, 'COMPLETED')" title="Mark Completed">
            <i class="fas fa-check"></i>
        </button>
        <button class="btn-icon btn-cancel" onclick="updateStatus(${app.id}, 'CANCELLED')" title="Cancel">
            <i class="fas fa-times"></i>
        </button>
    `;
}

// --- EMR Modal Logic ---
const consultationModal = document.getElementById('consultationModal');
const consultationForm = document.getElementById('consultationForm');

// Update logic to open modal for completion
window.openConsultationModal = function (appointmentId) {
    if (consultationModal) {
        document.getElementById('appointmentId').value = appointmentId;
        consultationModal.style.display = 'flex';
    }
}

window.closeConsultationModal = function () {
    if (consultationModal) {
        consultationModal.style.display = 'none';
        consultationForm.reset();
    }
}

// Override updateStatus to handle COMPLETED separately
window.updateStatus = async function (id, status) {
    if (status === 'COMPLETED') {
        openConsultationModal(id);
        return;
    }

    if (!confirm(`Mark appointment as ${status}?`)) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/appointments/${id}/status?status=${status}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast(`Appointment ${status.toLowerCase()}`, 'success');
            fetchAppointments();
        } else {
            const data = await response.json();
            showToast(data.error || 'Update failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Something went wrong', 'error');
    }
}

// Handle Form Submit
if (consultationForm) {
    consultationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const appointmentId = document.getElementById('appointmentId').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const prescription = document.getElementById('prescription').value;
        const notes = document.getElementById('notes').value;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/medical-records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointmentId,
                    diagnosis,
                    prescription,
                    notes,
                    treatmentPlan: notes
                })
            });

            if (response.ok) {
                showToast('Consultation completed successfully!', 'success');
                closeConsultationModal();
                fetchAppointments(); // Refresh
            } else {
                const data = await response.json();
                showToast(data.error || 'Failed to save record', 'error');
            }
        } catch (error) {
            console.error('EMR Error:', error);
            showToast('Error saving medical record', 'error');
        }
    });
}
window.updateStatus = updateStatus;

// Toast Helper (Copied from other files for standalone capability)
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const content = toast.querySelector('.toast-content');
    const msgSpan = toast.querySelector('.toast-message');

    // Reset classes
    toast.className = 'toast';
    content.className = 'toast-content';

    // Add type class
    toast.classList.add(type);
    msgSpan.textContent = message;

    // Show
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
// Expose updateStatus to window for onclick
window.updateStatus = updateStatus;
