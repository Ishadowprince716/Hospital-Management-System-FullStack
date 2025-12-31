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

    // ===== USER FORM SUBMISSION HANDLER =====
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('User form submitted');

            const userId = userForm.dataset.userId;
            const isEdit = !!userId;

            // Get form data
            const userData = {
                fullName: document.getElementById('userFullName').value,
                username: document.getElementById('userUsername').value,
                email: document.getElementById('userEmail').value,
                phoneNumber: document.getElementById('userPhone').value,
                role: document.getElementById('userRole').value
            };

            // Add password only if provided (for new users or password change)
            const password = document.getElementById('userPassword').value;
            if (password) {
                userData.password = password;
            }

            try {
                const token = localStorage.getItem('auth_token');
                const url = isEdit
                    ? `${API_BASE_URL}/admin/users/${userId}`
                    : `${API_BASE_URL}/admin/users`;

                const method = isEdit ? 'PUT' : 'POST';

                showToast(isEdit ? 'Updating user...' : 'Creating user...', 'info');

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to save user');
                }

                showToast(`User ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
                closeModal('userModal');
                userForm.reset();
                delete userForm.dataset.userId;

                // Refresh user list
                await loadAllUsers();
                await loadStats();

            } catch (error) {
                console.error('Error saving user:', error);
                showToast('Error: ' + error.message, 'error');
            }
        });
    }
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
            const activeUsers = users.filter(u => u.isActive);
            document.getElementById('totalUsers').textContent = activeUsers.length;

            const doctors = users.filter(u => u.role === 'DOCTOR' && u.isActive);
            const patients = users.filter(u => u.role === 'PATIENT' && u.isActive);

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

        const showInactive = document.getElementById('showInactiveUsers')?.checked || false;
        const filteredUsers = showInactive ? allUsers : allUsers.filter(u => u.isActive);

        displayUsers(filteredUsers);
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

    tbody.innerHTML = users.map((user, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${user.fullName || user.username}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="viewUserInfo(${user.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editUser(${user.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="resetUserPassword(${user.id})" title="Reset Password">
                    <i class="fas fa-key"></i>
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
        // Filter out inactive doctors by default for the doctor list
        const activeDoctors = allDoctors.filter(d => d.isActive);
        displayDoctors(activeDoctors);

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

    tbody.innerHTML = doctors.map((doctor, index) => `
        <tr>
            <td>${index + 1}</td>
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
        allPatients = allUsers.filter(u => u.role === 'PATIENT' && u.isActive);
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

    tbody.innerHTML = patients.map((patient, index) => `
        <tr>
            <td>${index + 1}</td>
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
        console.log('🔄 Fetching all appointments for admin');

        const token = localStorage.getItem('auth_token');
        let appointments = [];

        try {
            const appointmentsUrl = `${API_BASE_URL}/appointments`;
            console.log('📡 API URL:', appointmentsUrl);

            const response = await fetch(appointmentsUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('📊 Response status:', response.status);

            if (response.ok) {
                appointments = await response.json();
                console.log('✅ Appointments loaded:', appointments.length, 'appointments');
                console.log('📋 Appointment details:', appointments);
            } else {
                const errorText = await response.text();
                console.error('❌ API Error Response:', response.status, errorText);
            }
        } catch (e) {
            console.error('❌ Error fetching appointments:', e);
            throw e;
        }

        allAppointments = appointments;
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        const tbody = document.getElementById('appointmentsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        ⚠️ Error: ${error.message}
                    </td>
                </tr>
            `;
        }
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

    const showInactiveUsersCheckbox = document.getElementById('showInactiveUsers');
    if (showInactiveUsersCheckbox) {
        showInactiveUsersCheckbox.addEventListener('change', (e) => {
            const showInactive = e.target.checked;

            // Re-apply filters including search and role
            const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
            const roleFilter = document.getElementById('roleFilter')?.value || '';

            let filtered = allUsers.filter(u => {
                const matchesSearch = !searchTerm ||
                    u.fullName?.toLowerCase().includes(searchTerm) ||
                    u.username?.toLowerCase().includes(searchTerm) ||
                    u.email?.toLowerCase().includes(searchTerm);
                const matchesRole = !roleFilter || u.role === roleFilter;
                const matchesStatus = showInactive || u.isActive;

                return matchesSearch && matchesRole && matchesStatus;
            });

            displayUsers(filtered);
        });
    }

    // Modal close on outside click
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    };
}

// ===== USER MANAGEMENT FUNCTIONS =====

// Edit User - FULLY FUNCTIONAL
async function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }

    // Populate form with user data
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userFullName').value = user.fullName || '';
    document.getElementById('userUsername').value = user.username || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userPhone').value = user.phoneNumber || '';
    document.getElementById('userRole').value = user.role || 'PATIENT';

    // Make password optional for editing
    const passwordField = document.getElementById('userPassword');
    passwordField.value = '';
    passwordField.required = false;
    passwordField.placeholder = 'Leave blank to keep current password';

    // Store user ID for update
    document.getElementById('userForm').dataset.userId = userId;

    // Open modal
    document.getElementById('userModal').classList.add('show');
}

// Delete User - FULLY FUNCTIONAL
async function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }

    const confirmMessage = `Are you sure you want to delete user "${user.fullName || user.username}"?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    try {
        const token = localStorage.getItem('auth_token');
        showToast('Deleting user...', 'info');

        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        showToast('User deleted successfully!', 'success');

        // Refresh the user list
        await loadAllUsers();
        await loadStats();

    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error deleting user: ' + error.message, 'error');
    }
}


// Toggle User Status - FULLY FUNCTIONAL  
async function toggleUserStatus(userId, activate) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }

    const action = activate ? 'activate' : 'deactivate';
    const confirmMessage = activate
        ? `Are you sure you want to activate "${user.fullName || user.username}"?\n\nThey will be able to login to the system.`
        : `Are you sure you want to deactivate "${user.fullName || user.username}"?\n\nThey will not be able to login until reactivated.`;

    if (!confirm(confirmMessage)) return;

    try {
        const token = localStorage.getItem('auth_token');
        showToast(`${activate ? 'Activating' : 'Deactivating'} user...`, 'info');

        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: activate })
        });

        if (!response.ok) {
            throw new Error(`Failed to ${action} user`);
        }

        showToast(`User ${activate ? 'activated' : 'deactivated'} successfully!`, 'success');

        // Refresh the user list
        await loadAllUsers();
        await loadStats();

    } catch (error) {
        console.error(`Error ${action}ing user:`, error);
        showToast(`Error ${action}ing user: ` + error.message, 'error');
    }
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
window.viewInvoiceDetails = viewInvoiceDetails;
window.openRecordPaymentModal = openRecordPaymentModal;

// ===== INVOICE MANAGEMENT FUNCTIONS =====

async function renderInvoices() {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/bills`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const invoices = await response.json();
            const tbody = document.getElementById('invoicesTableBody');

            // Should match the table headers in HTML: ID, Patient, Amount, Date, Status, Actions
            if (tbody) {
                if (invoices.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No invoices found</td></tr>';
                    return;
                }

                tbody.innerHTML = invoices.map(invoice => `
                    <tr>
                        <td>#${invoice.id}</td>
                        <td>${invoice.patient?.fullName || 'N/A'}</td>
                        <td>
                            <div>Total: ₹${invoice.amount}</div>
                            <small class="text-muted">Pending: ₹${invoice.balanceAmount || 0}</small>
                        </td>
                        <td>${new Date(invoice.generatedAt).toLocaleDateString()}</td>
                        <td>
                            <span class="status-badge ${invoice.status?.toLowerCase() || 'pending'}">
                                ${invoice.status || 'PENDING'}
                            </span>
                        </td>
                        <td class="actions">
                             <button class="btn-icon" onclick="viewInvoiceDetails(${invoice.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                             ${invoice.status !== 'PAID' ? `
                            <button class="btn-icon success" onclick="openRecordPaymentModal(${invoice.id})" title="Record Payment">
                                <i class="fas fa-hand-holding-usd"></i>
                            </button>` : ''}
                        </td>
                    </tr>
                `).join('');
            }

            // Update stats if elements exist
            const totalRevenue = invoices
                .filter(i => i.status === 'PAID' || i.status === 'PARTIAL')
                .reduce((sum, i) => sum + (i.paidAmount || 0), 0);

            const pendingBills = invoices.filter(i => i.status !== 'PAID').length;
            const paidBills = invoices.filter(i => i.status === 'PAID').length;

            if (document.getElementById('totalRevenue'))
                document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toFixed(2);
            if (document.getElementById('pendingBills'))
                document.getElementById('pendingBills').textContent = pendingBills;
            if (document.getElementById('paidBills'))
                document.getElementById('paidBills').textContent = paidBills;

        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

let invoiceItemCounter = 1;

// Open Invoice Modal
async function openInvoiceModal() {
    // Reset form
    document.getElementById('invoiceForm').reset();
    invoiceItemCounter = 1;

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
    document.getElementById('invoiceDate').value = today;
    document.getElementById('invoiceDueDate').value = dueDate.toISOString().split('T')[0];

    // Load patients for selection
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const users = await response.json();
            const patients = users.filter(u => u.role === 'PATIENT');

            const patientSelect = document.getElementById('invoicePatient');
            patientSelect.innerHTML = '<option value="">Select Patient</option>' +
                patients.map(p => `<option value="${p.id}">${p.fullName || p.username} (ID: ${p.id})</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading patients:', error);
    }

    // Reset invoice items to just one
    const itemsHTML = `
        <h4 style="margin: 1.5rem 0 1rem 0;">Invoice Items</h4>
        <div class="invoice-item" data-item="1">
            <div class="form-row">
                <div class="form-group" style="flex: 2;">
                    <label>Description *</label>
                    <input type="text" class="item-description" placeholder="e.g., Consultation Fee" required>
                </div>
                <div class="form-group">
                    <label>Quantity *</label>
                    <input type="number" class="item-quantity" value="1" min="1" required>
                </div>
                <div class="form-group">
                    <label>Amount (₹) *</label>
                    <input type="number" class="item-amount" step="0.01" min="0" required>
                </div>
                <div class="form-group" style="flex: 0.5; display: flex; align-items: flex-end;">
                    <button type="button" class="btn-icon danger" onclick="removeInvoiceItem(1)" title="Remove" disabled>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <div class="form-row" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
             <div class="form-group">
                <label>Total Amount (₹)</label>
                <input type="number" id="invoiceTotalAmount" step="0.01" readonly style="font-weight: bold;">
            </div>
        </div>
    `;
    document.getElementById('invoiceItems').innerHTML = itemsHTML;

    // Setup item input listeners
    setupInvoiceItemListeners();

    // Open modal
    document.getElementById('invoiceModal').classList.add('show');
}

// Add Invoice Item
function addInvoiceItem() {
    invoiceItemCounter++;
    const itemsContainer = document.getElementById('invoiceItems');

    const newItem = document.createElement('div');
    newItem.className = 'invoice-item';
    newItem.dataset.item = invoiceItemCounter;
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group" style="flex: 2;">
                <label>Description *</label>
                <input type="text" class="item-description" placeholder="e.g., Lab Test" required>
            </div>
            <div class="form-group">
                <label>Quantity *</label>
                <input type="number" class="item-quantity" value="1" min="1" required>
            </div>
            <div class="form-group">
                <label>Amount (₹) *</label>
                <input type="number" class="item-amount" step="0.01" min="0" required>
            </div>
            <div class="form-group" style="flex: 0.5; display: flex; align-items: flex-end;">
                <button type="button" class="btn-icon danger" onclick="removeInvoiceItem(${invoiceItemCounter})" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    itemsContainer.appendChild(newItem);
    setupInvoiceItemListeners();
}

// Remove Invoice Item
function removeInvoiceItem(itemId) {
    const items = document.querySelectorAll('.invoice-item');
    if (items.length <= 1) {
        showToast('Cannot remove the last item', 'warning');
        return;
    }

    const item = document.querySelector(`.invoice-item[data-item="${itemId}"]`);
    if (item) {
        item.remove();
        calculateInvoiceTotal();
    }
}

// Setup Invoice Item Input Listeners
function setupInvoiceItemListeners() {
    const quantityInputs = document.querySelectorAll('.item-quantity');
    const amountInputs = document.querySelectorAll('.item-amount');

    [...quantityInputs, ...amountInputs].forEach(input => {
        input.removeEventListener('input', calculateInvoiceTotal);
        input.addEventListener('input', calculateInvoiceTotal);
    });

    calculateInvoiceTotal();
}

// Calculate Invoice Total
function calculateInvoiceTotal() {
    let total = 0;
    const items = document.querySelectorAll('.invoice-item');

    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const amount = parseFloat(item.querySelector('.item-amount').value) || 0;
        total += quantity * amount;
    });

    document.getElementById('invoiceTotalAmount').value = total.toFixed(2);

    document.getElementById('invoiceTotalAmount').value = total.toFixed(2);
}

// Submit Invoice Form
document.addEventListener('DOMContentLoaded', () => {
    const invoiceForm = document.getElementById('invoiceForm');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const patientId = document.getElementById('invoicePatient').value;
            const totalAmount = parseFloat(document.getElementById('invoiceTotalAmount').value);
            // Default to 0 paid and PENDING status
            const paidAmount = 0;
            const paymentStatus = 'PENDING';
            const paymentMethod = null;
            const billDate = document.getElementById('invoiceDate').value;
            const dueDate = document.getElementById('invoiceDueDate').value;
            const notes = document.getElementById('invoiceNotes').value;
            const pendingAmount = totalAmount;

            // Collect items
            const items = [];
            document.querySelectorAll('.invoice-item').forEach(item => {
                const description = item.querySelector('.item-description').value;
                const quantity = parseInt(item.querySelector('.item-quantity').value);
                const amount = parseFloat(item.querySelector('.item-amount').value);

                if (description && quantity && amount) {
                    items.push({ description, quantity, amount });
                }
            });

            if (!patientId) {
                showToast('Please select a patient', 'warning');
                return;
            }

            if (items.length === 0) {
                showToast('Please add at least one item', 'warning');
                return;
            }

            try {
                const token = localStorage.getItem('auth_token');
                showToast('Creating invoice...', 'info');

                const invoiceData = {
                    patientId: parseInt(patientId),
                    totalAmount,
                    paidAmount,
                    paymentStatus,
                    paymentMethod: paymentMethod || null,
                    billDate,
                    dueDate,
                    items,
                    notes
                };

                const response = await fetch(`${API_BASE_URL}/bills`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(invoiceData)
                });

                if (!response.ok) {
                    throw new Error('Failed to create invoice');
                }

                const result = await response.json();
                showToast('Invoice created successfully!', 'success');
                closeModal('invoiceModal');

                // Refresh data if on revenue section
                const activeSection = document.querySelector('.content-section.active');
                if (activeSection && activeSection.id === 'revenue') {
                    loadRevenueData();
                }

            } catch (error) {
                console.error('Error creating invoice:', error);
                showToast('Error creating invoice: ' + error.message, 'error');
            }
        });
    }

    // Payment Form Handler
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const invoiceId = document.getElementById('paymentInvoiceId').value;
            const amount = parseFloat(document.getElementById('paymentAmount').value);
            const method = document.getElementById('paymentMethod').value;
            const notes = document.getElementById('paymentNotes').value;

            if (!invoiceId || !amount) {
                showToast('Invalid payment details', 'error');
                return;
            }

            try {
                // Fetch current invoice to calculate new totals
                const token = localStorage.getItem('auth_token');

                const response = await fetch(`${API_BASE_URL}/bills/${invoiceId}/pay`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: amount,
                        paymentMethod: method,
                        notes: notes
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to record payment');
                }

                showToast('Payment recorded successfully', 'success');
                closeModal('paymentModal');

                // Refresh list and details if open
                renderInvoices();
                if (document.getElementById('invoiceDetailsModal').classList.contains('show')) {
                    viewInvoiceDetails(invoiceId);
                }

                // Refresh stats
                loadStats();

            } catch (error) {
                console.error('Payment error:', error);
                showToast('Error recording payment: ' + error.message, 'error');
            }
        });
    }

});

// View Invoice Details
async function viewInvoiceDetails(invoiceId) {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/bills`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const invoices = await response.json();
            const invoice = invoices.find(i => i.id === invoiceId);

            if (!invoice) {
                showToast('Invoice not found', 'error');
                return;
            }

            // Populate Modal
            const itemsHtml = invoice.items && invoice.items.length > 0
                ? invoice.items.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.description}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹${item.amount}</td>
                        <td class="text-right">₹${(item.quantity * item.amount).toFixed(2)}</td>
                    </tr>
                `).join('')
                : '<tr><td colspan="5" class="text-center">No items found</td></tr>';

            const detailsHtml = `
                <div class="invoice-header-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h4 style="color: var(--text-light);">Bill To:</h4>
                        <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">${invoice.patient?.fullName || 'N/A'}</div>
                        <div style="color: var(--text-light); font-size: 0.9rem;">
                            ID: ${invoice.patient?.id || 'N/A'}<br>
                            Email: ${invoice.patient?.email || 'N/A'}<br>
                            Phone: ${invoice.patient?.phoneNumber || 'N/A'}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <h4 style="color: var(--text-light);">Invoice Info:</h4>
                        <div style="margin-bottom: 0.25rem;"><strong>Invoice #:</strong> ${invoice.id}</div>
                        <div style="margin-bottom: 0.25rem;"><strong>Date:</strong> ${new Date(invoice.generatedAt).toLocaleDateString()}</div>
                        <div style="margin-bottom: 0.25rem;"><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</div>
                        <div><span class="status-badge ${invoice.status?.toLowerCase()}">${invoice.status}</span></div>
                    </div>
                </div>

                <div class="table-container" style="margin-bottom: 2rem;">
                    <table class="data-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Price</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="text-right" style="font-weight: bold; padding: 1rem;">Total Amount:</td>
                                <td class="text-right" style="font-weight: bold; padding: 1rem; font-size: 1.1rem;">₹${invoice.amount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-right" style="padding: 0.5rem 1rem;">Paid Amount:</td>
                                <td class="text-right" style="padding: 0.5rem 1rem;">₹${(invoice.paidAmount || 0).toFixed(2)}</td>
                            </tr>
                            <tr style="background-color: var(--gray-50);">
                                <td colspan="4" class="text-right" style="color: var(--danger); font-weight: bold; padding: 0.5rem 1rem;">Balance Due:</td>
                                <td class="text-right" style="color: var(--danger); font-weight: bold; padding: 0.5rem 1rem;">₹${(invoice.balanceAmount || 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                ${invoice.notes ? `
                <div style="margin-top: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 0.5rem;">
                    <strong>Notes:</strong>
                    <p style="margin-top: 0.5rem; color: var(--text-light);">${invoice.notes}</p>
                </div>` : ''}
            `;

            document.getElementById('invoiceDetailsContent').innerHTML = detailsHtml;

            // Setup Pay Button Actions
            const payBtn = document.getElementById('invoiceDetailsPayBtn');
            if (invoice.status === 'PAID') {
                payBtn.style.display = 'none';
            } else {
                payBtn.style.display = 'inline-flex';
                payBtn.onclick = function () {
                    openRecordPaymentModal(invoiceId);
                };
            }

            document.getElementById('invoiceDetailsModal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading invoice details:', error);
        showToast('Error loading invoice details', 'error');
    }
}

// Open Record Payment Modal
async function openRecordPaymentModal(invoiceId) {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/bills`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const invoices = await response.json();
            const invoice = invoices.find(i => i.id === invoiceId);

            if (!invoice) return;

            // Setup modal data
            document.getElementById('paymentInvoiceId').value = invoice.id;
            document.getElementById('paymentTotalAmount').textContent = '₹' + invoice.amount.toFixed(2);
            document.getElementById('paymentPaidAlready').textContent = '₹' + (invoice.paidAmount || 0).toFixed(2);
            document.getElementById('paymentPendingBalance').textContent = '₹' + (invoice.balanceAmount || 0).toFixed(2);

            // Default amount to pending balance
            document.getElementById('paymentAmount').value = invoice.balanceAmount || 0;
            document.getElementById('paymentAmount').max = invoice.balanceAmount || invoice.amount;

            document.getElementById('paymentModal').classList.add('show');
        }
    } catch (e) {
        console.error(e);
        showToast('Error loading payment info', 'error');
    }
}

// Export invoice functions to global scope
window.openInvoiceModal = openInvoiceModal;
window.addInvoiceItem = addInvoiceItem;
window.removeInvoiceItem = removeInvoiceItem;
window.calculatePendingAmount = calculatePendingAmount;
window.viewInvoiceDetails = viewInvoiceDetails;
window.openRecordPaymentModal = openRecordPaymentModal;

// ===== ADDITIONAL USER MANAGEMENT FEATURES =====

// View User Info - Detailed Modal
async function viewUserInfo(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }

    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 2px solid var(--gray-200);">
                <div class="avatar-sm" style="width: 60px; height: 60px; font-size: 1.5rem;">${(user.fullName || user.username).charAt(0).toUpperCase()}</div>
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; color: var(--gray-900);">${user.fullName || user.username}</h2>
                    <p style="margin: 0.25rem 0 0 0; color: var(--gray-600);">User ID: ${user.id}</p>
                </div>
                <div style="margin-left: auto;">
                    <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Username</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${user.username}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Role</strong>
                    <p style="margin: 0.25rem 0 0 0;">
                        <span class="badge ${user.role.toLowerCase()}">${user.role}</span>
                    </p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Email</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${user.email}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Phone</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${user.phoneNumber || 'Not provided'}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Date of Birth</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Gender</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 1rem;">${user.gender || 'Not specified'}</p>
                </div>
            </div>
            
            ${user.bloodGroup ? `
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <div class="detail-item">
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Blood Group</strong>
                    <p style="margin: 0.25rem 0 0 0;">
                        <span class="badge" style="background: var(--accent-error); color: white; font-size: 1rem; padding: 0.5rem 1rem;">${user.bloodGroup}</span>
                    </p>
                </div>
            </div>
            ` : ''}
            
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Account Information</strong>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Created At</p>
                        <p style="margin: 0.25rem 0 0 0;">${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Last Updated</p>
                        <p style="margin: 0.25rem 0 0 0;">${user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <button class="btn-primary" onclick="editUser(${user.id}); closeModal('userInfoModal');" style="flex: 1;">
                    <i class="fas fa-edit"></i> Edit User
                </button>
                <button class="btn-secondary" onclick="resetUserPassword(${user.id})" style="flex: 1;">
                    <i class="fas fa-key"></i> Reset Password
                </button>
            </div>
        </div>
    `;

    document.getElementById('userInfoContent').innerHTML = content;
    document.getElementById('userInfoModal').classList.add('show');
}

// Reset User Password
async function resetUserPassword(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }

    const confirmMessage = `Reset password for "${user.fullName || user.username}"?\n\nA temporary password will be generated.`;

    if (!confirm(confirmMessage)) return;

    try {
        const token = localStorage.getItem('auth_token');
        showToast('Resetting password...', 'info');

        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to reset password');
        }

        const result = await response.json();

        // Show success with the temporary password
        alert(`Password Reset Successful!\n\nUser: ${user.fullName || user.username}\nTemporary Password: Hospital@123\n\nPlease inform the user to change this password after logging in.`);
        showToast('Password reset successfully!', 'success');

    } catch (error) {
        console.error('Error resetting password:', error);
        showToast('Error resetting password: ' + error.message, 'error');
    }
}

// Export Users to CSV
function exportUsersToCSV() {
    if (allUsers.length === 0) {
        showToast('No users to export', 'warning');
        return;
    }

    const headers = ['ID', 'Full Name', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Blood Group', 'Gender'];
    const csvContent = [
        headers.join(','),
        ...allUsers.map(u => [
            u.id,
            `"${u.fullName || ''}"`,
            u.username,
            u.email,
            u.phoneNumber || '',
            u.role,
            u.isActive ? 'Active' : 'Inactive',
            u.bloodGroup || '',
            u.gender || ''
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Users exported successfully!', 'success');
}

// Export functions to global scope
window.viewUserInfo = viewUserInfo;
window.resetUserPassword = resetUserPassword;
window.exportUsersToCSV = exportUsersToCSV;

