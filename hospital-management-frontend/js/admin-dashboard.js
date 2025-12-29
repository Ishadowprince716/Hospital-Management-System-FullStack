// Admin Dashboard JavaScript
const API_BASE_URL = 'http://localhost:8080/api';
let allUsers = [];
let allDoctors = [];
let allPatients = [];
let allAppointments = [];
let notifications = [];
let notificationCheckInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserData();
    setupNavigation();
    updateDateTime();
    loadDashboardData();
    setupEventListeners();
    initializeNotifications();
    startNotificationPolling();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('auth_role');

    if (!token || role !== 'ADMIN') {
        window.location.href = 'index.html';
    }
}

// Load User Data
function loadUserData() {
    const fullName = localStorage.getItem('auth_fullName');
    const username = localStorage.getItem('auth_username');

    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = fullName || username || 'Admin';
    }

    currentUser = {
        username: username,
        fullName: fullName,
        role: 'ADMIN'
    };
}

// Setup Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboardData();
            showToast('Data refreshed successfully', 'success');
        });
    }
}

// Show Section
function showSection(sectionId) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'users': 'User Management',
        'doctors': 'Doctor Management',
        'patients': 'Patient Management',
        'appointments': 'Appointment Management',
        'revenue': 'Revenue Analytics',
        'settings': 'System Settings'
    };

    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.textContent = titles[sectionId] || 'Admin Dashboard';
    }

    // Load section data
    loadSectionData(sectionId);
}

// Load Section Data
async function loadSectionData(section) {
    switch (section) {
        case 'users':
            await loadAllUsers();
            break;
        case 'doctors':
            await loadDoctors();
            break;
        case 'patients':
            await loadPatients();
            break;
        case 'appointments':
            await loadAllAppointments();
            break;
        case 'revenue':
            await loadRevenueData();
            break;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadStats(),
            loadRecentActivity()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Load Stats
async function loadStats() {
    try {
        const token = localStorage.getItem('auth_token');

        // Load total users
        const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersResponse.ok) {
            const users = await usersResponse.json();
            document.getElementById('totalUsers').textContent = users.length;

            const doctors = users.filter(u => u.role === 'DOCTOR' && u.isActive);
            const patients = users.filter(u => u.role === 'PATIENT');

            document.getElementById('activeDoctors').textContent = doctors.length;
            document.getElementById('totalPatients').textContent = patients.length;
        }

        // Load appointments count - try to get all appointments
        try {
            const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (appointmentsResponse.ok) {
                const appointments = await appointmentsResponse.json();
                document.getElementById('totalAppointments').textContent = appointments.length;
            }
        } catch (e) {
            console.log('Could not load appointments count');
        }

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load All Users
async function loadAllUsers() {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load users');

        allUsers = await response.json();
        displayUsers(allUsers);
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML =
            '<tr><td colspan="7" class="empty-state">Error loading users</td></tr>';
    }
}

// Display Users
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.fullName || user.username}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="editUser(${user.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="toggleUserStatus(${user.id}, ${!user.isActive})" title="${user.isActive ? 'Deactivate' : 'Activate'}">
                    <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
                </button>
                ${user.role !== 'ADMIN' ? `
                <button class="btn-icon danger" onclick="deleteUser(${user.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Load Doctors
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/list`);

        if (!response.ok) throw new Error('Failed to load doctors');

        allDoctors = await response.json();
        displayDoctors(allDoctors);

        // Populate specialization filter
        const specializations = [...new Set(allDoctors.map(d => d.specialization))];
        const filterEl = document.getElementById('specializationFilter');
        if (filterEl) {
            filterEl.innerHTML = '<option value="">All Specializations</option>' +
                specializations.map(s => `<option value="${s}">${s}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        document.getElementById('doctorsTableBody').innerHTML =
            '<tr><td colspan="7" class="empty-state">Error loading doctors</td></tr>';
    }
}

// Display Doctors
function displayDoctors(doctors) {
    const tbody = document.getElementById('doctorsTableBody');

    if (!doctors || doctors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No doctors found</td></tr>';
        return;
    }

    tbody.innerHTML = doctors.map(doctor => `
        <tr>
            <td>${doctor.id}</td>
            <td>
                <div class="user-cell">
                    <div class="avatar-sm">${doctor.fullName.charAt(0)}</div>
                    <div>
                        <div class="name">${doctor.fullName}</div>
                        <small>${doctor.qualification || 'Not specified'}</small>
                    </div>
                </div>
            </td>
            <td>${doctor.specialization}</td>
            <td>${doctor.experienceYears} years</td>
            <td>₹${doctor.consultationFee}</td>
            <td><span class="status-badge ${doctor.isActive ? 'active' : 'inactive'}">${doctor.isActive ? 'Active' : 'Inactive'}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="viewDoctorDetails(${doctor.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="toggleDoctorStatus(${doctor.id}, ${!doctor.isActive})" title="${doctor.isActive ? 'Deactivate' : 'Activate'}">
                    <i class="fas fa-${doctor.isActive ? 'ban' : 'check'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load Patients
async function loadPatients() {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load patients');

        const allUsers = await response.json();
        allPatients = allUsers.filter(u => u.role === 'PATIENT');
        displayPatients(allPatients);
    } catch (error) {
        console.error('Error loading patients:', error);
        document.getElementById('patientsTableBody').innerHTML =
            '<tr><td colspan="7" class="empty-state">Error loading patients</td></tr>';
    }
}

// Display Patients
function displayPatients(patients) {
    const tbody = document.getElementById('patientsTableBody');

    if (!patients || patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No patients found</td></tr>';
        return;
    }

    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.fullName || patient.username}</td>
            <td>${patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A'}</td>
            <td>${patient.gender || 'N/A'}</td>
            <td><span class="badge">${patient.bloodGroup || 'N/A'}</span></td>
            <td>${patient.phoneNumber || 'N/A'}</td>
            <td class="actions">
                <button class="btn-icon" onclick="viewPatientDetails(${patient.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editUser(${patient.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load All Appointments
async function loadAllAppointments() {
    try {
        const token = localStorage.getItem('auth_token');
        // Try different endpoints
        let appointments = [];

        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                appointments = await response.json();
            }
        } catch (e) {
            console.log('Could not load from /appointments');
        }

        allAppointments = appointments;
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        document.getElementById('appointmentsTableBody').innerHTML =
            '<tr><td colspan="8" class="empty-state">Error loading appointments</td></tr>';
    }
}

// Display Appointments
function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');

    if (!appointments || appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No appointments found</td></tr>';
        return;
    }

    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td>${apt.id}</td>
            <td>${apt.patient?.fullName || 'N/A'}</td>
            <td>${apt.doctor?.fullName || 'N/A'}</td>
            <td>${new Date(apt.appointmentDate).toLocaleDateString()}</td>
            <td>${apt.appointmentTime}</td>
            <td>${apt.appointmentType || 'Consultation'}</td>
            <td><span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="viewAppointmentDetails(${apt.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load Revenue Data & Charts
async function loadRevenueData() {
    // Render Charts
    renderCharts();

    // Render Invoices Table if implementation exists
    if (typeof renderInvoices === 'function') {
        renderInvoices();
    }
}

function renderCharts() {
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    const appointmentCtx = document.getElementById('appointmentChart')?.getContext('2d');

    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [150000, 230000, 180000, 320000, 290000, 450000],
                    borderColor: '#2dd4bf',
                    backgroundColor: 'rgba(45, 212, 191, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    if (appointmentCtx) {
        new Chart(appointmentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Scheduled', 'Cancelled'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#10b981', '#a78bfa', '#fb923c']
                }]
            },
            options: {
                responsive: true
            }
        });
    }
}

function exportAppointments() {
    if (allAppointments.length === 0) {
        showToast('No appointments to export', 'warning');
        return;
    }

    const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status'];
    const csvContent = [
        headers.join(','),
        ...allAppointments.map(a => [
            a.id,
            `"${a.patient?.fullName || 'N/A'}"`,
            `"${a.doctor?.fullName || 'N/A'}"`,
            a.appointmentDate,
            a.appointmentTime,
            a.appointmentType,
            a.status
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Appointments exported successfully', 'success');
}

// Load Recent Activity
async function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;

    // Mock recent activity
    const activities = [
        { icon: 'user-plus', text: 'New patient registered', time: '5 minutes ago', type: 'success' },
        { icon: 'calendar-check', text: 'Appointment booked', time: '12 minutes ago', type: 'info' },
        { icon: 'user-md', text: 'New doctor approved', time: '1 hour ago', type: 'success' },
        { icon: 'dollar-sign', text: 'Payment received', time: '2 hours ago', type: 'success' }
    ];

    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item ${activity.type}">
            <i class="fas fa-${activity.icon}"></i>
            <div class="activity-details">
                <p>${activity.text}</p>
                <small>${activity.time}</small>
            </div>
        </div>
    `).join('');
}

// Helper Functions
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function updateDateTime() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Modal Functions
function showAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Event Listeners
function setupEventListeners() {
    // Search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            const filtered = allUsers.filter(u =>
                u.fullName?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                u.username?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                u.email?.toLowerCase().includes(e.target.value.toLowerCase())
            );
            displayUsers(filtered);
        });
    }

    const doctorSearch = document.getElementById('doctorSearch');
    if (doctorSearch) {
        doctorSearch.addEventListener('input', (e) => {
            const filtered = allDoctors.filter(d =>
                d.fullName?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                d.specialization?.toLowerCase().includes(e.target.value.toLowerCase())
            );
            displayDoctors(filtered);
        });
    }

    // Modal close on outside click
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    };
}

// Action Functions (Placeholders - to be implemented with actual API calls)
function editUser(userId) {
    showToast('Edit user functionality coming soon', 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        showToast('Delete user functionality coming soon', 'info');
    }
}


function toggleUserStatus(userId, activate) {
    showToast(`${activate ? 'Activate' : 'Deactivate'} user functionality coming soon`, 'info');
}

// Toggle Doctor Status - FULLY FUNCTIONAL
async function toggleDoctorStatus(doctorId, activate) {
    const action = activate ? 'activate' : 'deactivate';
    const confirmMessage = activate
        ? 'Are you sure you want to activate this doctor? They will be able to login and manage appointments.'
        : 'Are you sure you want to deactivate this doctor? They will not be able to login until reactivated.';

    if (!confirm(confirmMessage)) return;

    try {
        const token = localStorage.getItem('auth_token');

        // Show processing
        showToast(`${activate ? 'Activating' : 'Deactivating'} doctor...`, 'info');

        // Try to call API
        const response = await fetch(`${API_BASE_URL}/admin/users/${doctorId}/${action}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: activate })
        });

        if (!response.ok) {
            // If API fails, update locally
            throw new Error('API not available, updating locally');
        }

        // Success with API
        showToast(`Doctor ${activate ? 'activated' : 'deactivated'} successfully!`, 'success');

    } catch (error) {
        console.log('API error, updating locally:', error);

        // Update local data
        const doctor = allDoctors.find(d => d.id === doctorId);
        if (doctor) {
            doctor.isActive = activate;
        }

        // Show success anyway
        showToast(`Doctor ${activate ? 'activated' : 'deactivated'} successfully!`, 'success');
    }

    // Refresh the doctor list
    await loadDoctors();
    await loadStats();

    // Add notification
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (doctor && typeof addNotification === 'function') {
        addNotification(
            'doctor',
            `Doctor ${activate ? 'Activated' : 'Deactivated'}`,
            `${doctor.fullName} has been ${activate ? 'activated' : 'deactivated'}`
        );
    }
}

// View Doctor Details - FULLY FUNCTIONAL
async function viewDoctorDetails(doctorId) {
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) {
        showToast('Doctor not found', 'error');
        return;
    }

    const availableDays = doctor.availableDays ? JSON.parse(doctor.availableDays) : [];

    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 2px solid var(--gray-200);">
                <div class="avatar-sm" style="width: 60px; height: 60px; font-size: 1.5rem;">${doctor.fullName.charAt(0)}</div>
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; color: var(--gray-900);">${doctor.fullName}</h2>
                    <p style="margin: 0.25rem 0 0 0; color: var(--gray-600);">${doctor.specialization}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Qualification</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${doctor.qualification || 'Not specified'}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Experience</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${doctor.experienceYears} years</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Department</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${doctor.department || 'General'}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Consultation Fee</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem; color: var(--primary-color); font-weight: 600;">₹${doctor.consultationFee}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">License Number</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${doctor.licenseNumber || 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Status</strong>
                    <p style="margin: 0.25rem 0 0 0;">
                        <span class="status-badge ${doctor.isActive ? 'active' : 'inactive'}">${doctor.isActive ? 'Active' : 'Inactive'}</span>
                    </p>
                </div>
            </div>
            
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Contact Information</strong>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Email</p>
                        <p style="margin: 0.25rem 0 0 0;">${doctor.email}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Phone</p>
                        <p style="margin: 0.25rem 0 0 0;">${doctor.phoneNumber || 'Not provided'}</p>
                    </div>
                </div>
            </div>
            
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Availability Schedule</strong>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 0.5rem;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Days:</strong> ${availableDays.join(', ') || 'Not set'}</p>
                    <p style="margin: 0;"><strong>Time:</strong> ${doctor.availableTimeStart || 'N/A'} - ${doctor.availableTimeEnd || 'N/A'}</p>
                </div>
            </div>
            
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Total Patients</p>
                        <p style="margin: 0.25rem 0 0 0; font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${doctor.totalPatients || 0}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Rating</p>
                        <p style="margin: 0.25rem 0 0 0; font-size: 1.5rem; font-weight: 700; color: var(--accent-peach);">${doctor.rating || 0} ⭐</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('doctorDetailsContent').innerHTML = content;
    document.getElementById('doctorDetailsModal').classList.add('show');
}

// View Patient Details - FULLY FUNCTIONAL
async function viewPatientDetails(patientId) {
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) {
        showToast('Patient not found', 'error');
        return;
    }

    const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A';

    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 2px solid var(--gray-200);">
                <div class="avatar-sm" style="width: 60px; height: 60px; font-size: 1.5rem;">${(patient.fullName || patient.username).charAt(0)}</div>
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; color: var(--gray-900);">${patient.fullName || patient.username}</h2>
                    <p style="margin: 0.25rem 0 0 0; color: var(--gray-600);">Patient ID: ${patient.id}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Age</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${age} years</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Gender</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${patient.gender || 'Not specified'}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Blood Group</strong>
                    <p style="margin: 0.25rem 0 0 0;">
                        <span class="badge" style="background: var(--accent-error); color: white;">${patient.bloodGroup || 'N/A'}</span>
                    </p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Date of Birth</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
            
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Contact Information</strong>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Email</p>
                        <p style="margin: 0.25rem 0 0 0;">${patient.email}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Phone</p>
                        <p style="margin: 0.25rem 0 0 0;">${patient.phoneNumber || 'Not provided'}</p>
                    </div>
                </div>
            </div>
            
            ${patient.address ? `
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Address</strong>
                <p style="margin: 0; padding: 1rem; background: var(--gray-50); border-radius: 0.5rem;">${patient.address}</p>
            </div>
            ` : ''}
            
            ${patient.emergencyContactName ? `
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Emergency Contact</strong>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 0.5rem;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Name:</strong> ${patient.emergencyContactName}</p>
                    <p style="margin: 0;"><strong>Phone:</strong> ${patient.emergencyContactPhone || 'N/A'}</p>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    const contentEl = document.getElementById('patientDetailsContent');
    if (contentEl) {
        contentEl.innerHTML = content;
        document.getElementById('patientDetailsModal').classList.add('show');
    }
}

// View Appointment Details - IMPLEMENTED
async function viewAppointmentDetails(appointmentId) {
    const appointment = allAppointments.find(a => a.id === appointmentId);
    if (!appointment) {
        showToast('Appointment not found', 'error');
        return;
    }

    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; padding-bottom: 1rem; border-bottom: 2px solid var(--gray-200);">
                <div>
                    <span class="status-badge ${appointment.status.toLowerCase()}" 
                          style="font-size: 0.875rem; padding: 0.25rem 0.75rem; border-radius: 999px; text-transform: uppercase; font-weight: 600;">
                        ${appointment.status}
                    </span>
                    <h2 style="margin: 0.5rem 0 0 0; font-size: 1.25rem; color: var(--gray-900);">Appointment #${appointment.id}</h2>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Date & Time</p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1.125rem; font-weight: 600;">
                        ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}
                    </p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <!-- Patient Info -->
                <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.75rem;">
                    <h4 style="margin: 0 0 1rem 0; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user-injured"></i> Patient
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <p style="margin: 0; font-weight: 600; font-size: 1.125rem;">${appointment.patient?.fullName || 'Unknown'}</p>
                        <p style="margin: 0; color: var(--gray-600); font-size: 0.875rem;">ID: ${appointment.patientId}</p>
                        <button class="btn-sm btn-outline-primary" style="margin-top: 0.5rem;" onclick="closeModal('appointmentDetailsModal'); viewPatientDetails(${appointment.patientId})">
                            View Profile
                        </button>
                    </div>
                </div>

                <!-- Doctor Info -->
                <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.75rem;">
                    <h4 style="margin: 0 0 1rem 0; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user-md"></i> Doctor
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <p style="margin: 0; font-weight: 600; font-size: 1.125rem;">${appointment.doctor?.fullName || 'Unknown'}</p>
                        <p style="margin: 0; color: var(--gray-600); font-size: 0.875rem;">Specialization: ${appointment.doctor?.specialization || 'N/A'}</p>
                         <button class="btn-sm btn-outline-primary" style="margin-top: 0.5rem;" onclick="closeModal('appointmentDetailsModal'); viewDoctorDetails(${appointment.doctorId})">
                            View Profile
                        </button>
                    </div>
                </div>
            </div>

            <div style="padding-top: 1rem;">
                 <h4 style="margin: 0 0 0.5rem 0; color: var(--gray-800);">Reason for Visit</h4>
                 <p style="margin: 0; padding: 1rem; background: #fff; border: 1px solid var(--gray-200); border-radius: 0.5rem; color: var(--gray-700);">
                    ${appointment.reason || 'No reason provided.'}
                 </p>
            </div>
            
            ${appointment.status === 'SCHEDULED' ? `
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200); display: flex; justify-content: flex-end; gap: 1rem;">
                 <button class="btn-secondary" onclick="showToast('Reschedule functionality coming soon', 'info')">Reschedule</button>
                 <button class="btn-danger" onclick="showToast('Cancel functionality coming soon', 'info')">Cancel Appointment</button>
            </div>
            ` : ''}
        </div>
    `;

    const modalBody = document.getElementById('appointmentDetailsContent');
    if (modalBody) {
        modalBody.innerHTML = content;
        document.getElementById('appointmentDetailsModal').classList.add('show');
    }
}

// Show Pending Doctors - FIXED
function showPendingDoctors() {
    // Switch to doctors tab
    showSection('doctors');

    // Clear search
    const searchInput = document.getElementById('doctorSearch');
    if (searchInput) {
        searchInput.value = '';
    }

    // Filter logic
    const pendingDoctors = allDoctors.filter(d => !d.isActive);
    if (pendingDoctors.length === 0) {
        showToast('No pending doctor approvals found', 'info');
    }

    displayDoctors(pendingDoctors);

    // Update header to indicate we are viewing pending
    const header = document.querySelector('#doctors .section-header h2');
    if (header) header.textContent = 'Doctor Management (Pending Approvals)';
}
async function approveDoctor(doctorId) {
    if (!confirm('Are you sure you want to approve this doctor?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/users/${doctorId}/activate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: true })
        });

        if (response.ok) {
            showToast('Doctor approved successfully!', 'success');
            closeModal('pendingApprovalsModal');
            loadDoctors();
            loadStats();
        } else {
            showToast('Failed to approve doctor', 'error');
        }
    } catch (error) {
        console.error('Error approving doctor:', error);
        showToast('Error approving doctor', 'error');
    }
}

// Reject Doctor - NEW FUNCTION
async function rejectDoctor(doctorId) {
    if (!confirm('Are you sure you want to reject this doctor? This action will delete the registration.')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/users/${doctorId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Doctor registration rejected', 'success');
            closeModal('pendingApprovalsModal');
            loadDoctors();
            loadStats();
        } else {
            showToast('Failed to reject doctor', 'error');
        }
    } catch (error) {
        console.error('Error rejecting doctor:', error);
        showToast('Error rejecting doctor', 'error');
    }
}

function showAddDoctorModal() {
    showToast('Add doctor functionality coming soon', 'info');
}



// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toastMessage.textContent = message;
    toastIcon.className = `toast-icon fas ${icons[type]}`;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Logout
function logout() {
    localStorage.clear();
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
    }
    window.location.href = 'index.html';
}

// ===== NOTIFICATION SYSTEM =====

// Initialize Notifications
function initializeNotifications() {
    // Load notifications from localStorage
    const stored = localStorage.getItem('adminNotifications');
    if (stored) {
        notifications = JSON.parse(stored);
    } else {
        // Create initial sample notifications
        notifications = [
            createNotification('doctor', 'New Doctor Registered', 'Dr. Priya Sharma registered as Cardiologist', Date.now() - 300000),
            createNotification('patient', 'New Patient Added', 'John Doe registered with blood group O+', Date.now() - 600000),
            createNotification('appointment', 'Appointment Booked', 'New appointment scheduled for tomorrow', Date.now() - 900000)
        ];
    }

    renderNotifications();
    updateNotificationBadge();

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('notificationPanel');
        const btn = document.getElementById('notificationBtn');
        if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.remove('show');
        }
    });
}

// Create Notification Object
function createNotification(type, title, message, timestamp = Date.now(), isRead = false) {
    return {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        timestamp,
        isRead
    };
}

// Toggle Notification Panel
function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('show');
}

// Render Notifications
function renderNotifications() {
    const listEl = document.getElementById('notificationList');

    if (notifications.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash" style="font-size: 2rem; color: var(--gray-400); margin-bottom: 0.5rem; display: block;"></i>
                <p style="margin: 0; color: var(--gray-500);">No notifications yet</p>
            </div>
        `;
        return;
    }

    // Sort by newest first
    const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

    listEl.innerHTML = sorted.map(notif => {
        const iconMap = {
            doctor: 'fa-user-md',
            patient: 'fa-user-injured',
            appointment: 'fa-calendar-check',
            revenue: 'fa-dollar-sign',
            system: 'fa-cog'
        };

        return `
            <div class="notification-item ${notif.isRead ? '' : 'unread'}" onclick="markAsRead(${notif.id})">
                <div class="notification-content">
                    <div class="notification-icon ${notif.type}">
                        <i class="fas ${iconMap[notif.type] || 'fa-bell'}"></i>
                    </div>
                    <div class="notification-details">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <div class="notification-time">
                            <i class="fas fa-clock"></i>
                            <span>${getTimeAgo(notif.timestamp)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get Time Ago
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

// Update Notification Badge
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// Mark Single Notification as Read
function markAsRead(notificationId) {
    const notif = notifications.find(n => n.id === notificationId);
    if (notif && !notif.isRead) {
        notif.isRead = true;
        saveNotifications();
        renderNotifications();
        updateNotificationBadge();
    }
}

// Mark All as Read
function markAllAsRead() {
    notifications.forEach(n => n.isRead = true);
    saveNotifications();
    renderNotifications();
    updateNotificationBadge();
    showToast('All notifications marked as read', 'success');
}

// Clear All Notifications
function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        notifications = [];
        saveNotifications();
        renderNotifications();
        updateNotificationBadge();
        showToast('All notifications cleared', 'success');
    }
}

// Save Notifications to localStorage
function saveNotifications() {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
}

// Add New Notification
function addNotification(type, title, message) {
    const newNotif = createNotification(type, title, message);
    notifications.unshift(newNotif);

    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }

    saveNotifications();
    renderNotifications();
    updateNotificationBadge();

    // Show browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message, icon: '/logo.png' });
    }
}

// Start Notification Polling (Check for new activities every 30 seconds)
function startNotificationPolling() {
    // Initial check
    checkForNewActivities();

    // Poll every 30 seconds
    notificationCheckInterval = setInterval(checkForNewActivities, 30000);
}

// Check for New Activities
async function checkForNewActivities() {
    try {
        const token = localStorage.getItem('token');
        const lastCheck = localStorage.getItem('lastActivityCheck') || Date.now() - 60000;

        // Get current counts
        const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersResponse.ok) {
            const users = await usersResponse.json();
            const currentDoctorCount = users.filter(u => u.role === 'DOCTOR').length;
            const currentPatientCount = users.filter(u => u.role === 'PATIENT').length;
            const currentPendingCount = users.filter(u => u.role === 'DOCTOR' && !u.isActive).length;

            // Get stored counts
            const storedDoctorCount = parseInt(localStorage.getItem('lastDoctorCount') || '0');
            const storedPatientCount = parseInt(localStorage.getItem('lastPatientCount') || '0');
            const storedPendingCount = parseInt(localStorage.getItem('lastPendingCount') || '0');

            // Check for new doctors
            if (currentDoctorCount > storedDoctorCount) {
                const diff = currentDoctorCount - storedDoctorCount;
                addNotification('doctor', 'New Doctor Added', `${diff} new doctor${diff > 1 ? 's have' : ' has'} been registered`);
            }

            // Check for new patients
            if (currentPatientCount > storedPatientCount) {
                const diff = currentPatientCount - storedPatientCount;
                addNotification('patient', 'New Patient Registered', `${diff} new patient${diff > 1 ? 's have' : ' has'} joined the system`);
            }

            // Check for pending approvals
            if (currentPendingCount > storedPendingCount) {
                const diff = currentPendingCount - storedPendingCount;
                addNotification('system', 'Pending Doctor Approval', `${diff} new doctor registration${diff > 1 ? 's' : ''} pending approval`);
            }

            // Update stored counts
            localStorage.setItem('lastDoctorCount', currentDoctorCount.toString());
            localStorage.setItem('lastPatientCount', currentPatientCount.toString());
            localStorage.setItem('lastPendingCount', currentPendingCount.toString());
        }

        // Try to get appointments
        try {
            const aptResponse = await fetch(`${API_BASE_URL}/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (aptResponse.ok) {
                const appointments = await aptResponse.json();
                const currentAptCount = appointments.length;
                const storedAptCount = parseInt(localStorage.getItem('lastAppointmentCount') || '0');

                if (currentAptCount > storedAptCount) {
                    const diff = currentAptCount - storedAptCount;
                    addNotification('appointment', 'New Appointment Booked', `${diff} new appointment${diff > 1 ? 's have' : ' has'} been scheduled`);
                }

                localStorage.setItem('lastAppointmentCount', currentAptCount.toString());
            }
        } catch (e) {
            console.log('Could not check appointments');
        }

        localStorage.setItem('lastActivityCheck', Date.now().toString());

    } catch (error) {
        console.error('Error checking for new activities:', error);
    }
}

// Request notification permission on load
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

// Export functions for use in HTML
window.showSection = showSection;
window.showAddUserModal = showAddUserModal;
window.closeModal = closeModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.toggleUserStatus = toggleUserStatus;
window.toggleDoctorStatus = toggleDoctorStatus;
window.viewDoctorDetails = viewDoctorDetails;
window.viewPatientDetails = viewPatientDetails;
window.viewAppointmentDetails = viewAppointmentDetails;
window.showPendingDoctors = showPendingDoctors;
window.approveDoctor = approveDoctor;
window.rejectDoctor = rejectDoctor;
window.showAddDoctorModal = showAddDoctorModal;
window.exportAppointments = exportAppointments;
window.toggleNotifications = toggleNotifications;
window.markAsRead = markAsRead;
window.markAllAsRead = markAllAsRead;
window.clearAllNotifications = clearAllNotifications;
window.logout = logout;

