// Patient Dashboard JavaScript
const API_BASE_URL = window.hospitalAuth?.API_BASE_URL || 'http://localhost:8080/api';
const MOCK_MODE = window.hospitalAuth?.MOCK_MODE || false;
let currentUser = {};
let notifications = [];
let notificationBadgeCount = 0;
let allAppointments = [];
let allMedicalRecords = [];
let allPrescriptions = [];

// Initialize
function init() {
    try {
        initializeTheme();
        checkAuth();
        loadUserData();
        setupNavigation();
        loadDoctors();
        loadAppointments();
        loadMedicalRecords();
        loadPrescriptions();
        loadBills();
        initializeSampleNotifications();
        
        // Show initial skeleton loaders
        showSkeletons();

        // Verify all quick action functions are available
        verifyQuickActionFunctions();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

/**
 * Show skeleton loaders in data-heavy sections
 */
function showSkeletons() {
    const containers = ['recentAppointments', 'appointmentsList', 'recordsList', 'prescriptionsList', 'billsList'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `
                <div class="skeleton-table">
                    ${Array(5).fill(0).map(() => `
                        <div class="skeleton-table-row skeleton"></div>
                    `).join('')}
                </div>
            `;
        }
    });
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already loaded (scripts loaded at end of body)
    init();
}

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('auth_role');

    // Allow testing without login
    if (!token || role !== 'PATIENT') {
        // ... (keep test logic if needed, or redirect)
    }
}

function loadUserData() {
    const fullName = localStorage.getItem('auth_fullName');
    const username = localStorage.getItem('auth_username');
    const userId = localStorage.getItem('auth_userId');
    const role = localStorage.getItem('auth_role');

    console.log('Loading user data:', { fullName, username, userId, role });

    // Update UI
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const displayName = fullName || username || 'Patient';
        userNameElement.textContent = displayName;
        console.log('Updated userName element to:', displayName);
    } else {
        console.error('userName element not found in DOM');
    }

    currentUser = {
        id: userId,
        username: username,
        fullName: fullName,
        role: role
    };

    console.log('Loaded user:', currentUser);
}

// Setup Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

// Switch Section
function switchSection(sectionId) {
    try {
        if (!sectionId) {
            console.error('switchSection called without sectionId');
            return false;
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.section === sectionId;
            item.classList.toggle('active', isActive);
            if (isActive) {
                console.log('Activated nav item:', sectionId);
            }
        });

        // Update content sections
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.error('Section not found:', sectionId);
            return false;
        }

        document.querySelectorAll('.content-section').forEach(section => {
            const isActive = section.id === sectionId;
            section.classList.toggle('active', isActive);
        });

        // Update breadcrumb
        updateBreadcrumb(sectionId);

        // Scroll to top of content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }

        console.log('Switched to section:', sectionId);
        return true;
    } catch (error) {
        console.error('Error switching section:', error);
        return false;
    }
}
window.switchSection = switchSection;

/**
 * Verify all quick action functions are available
 */
function verifyQuickActionFunctions() {
    const requiredFunctions = [
        'switchSection',
        'quickActionDownloadPrescription',
        'quickActionScheduleFollowUp',
        'quickActionRequestLabTest',
        'submitLabTest',
        'closeModal'
    ];

    const missing = [];
    requiredFunctions.forEach(fn => {
        if (typeof window[fn] !== 'function') {
            missing.push(fn);
            console.warn(`Function ${fn} not found on window object`);
        }
    });

    if (missing.length > 0) {
        console.error('Missing quick action functions:', missing);
    } else {
        console.log('✓ All quick action functions verified');
    }
}
window.verifyQuickActionFunctions = verifyQuickActionFunctions;

// Helper for authorized fetch
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    return fetch(url, { ...options, headers });
}

// Load Doctors
async function loadDoctors() {
    try {
        if (MOCK_MODE) {
            populateDoctors(window.hospitalAuth?.MOCK_DOCTORS || []);
            return;
        }

        const response = await fetchWithAuth(`${API_BASE_URL}/doctors`);
        if (!response.ok) throw new Error('Failed to fetch doctors');

        const apiResponse = await response.json();
        const doctors = apiResponse.data || apiResponse || [];
        populateDoctors(doctors);

    } catch (error) {
        console.error('Error loading doctors:', error);
        window.hospitalAuth?.showToast('Failed to load doctors list', 'error');
    }
}

// Profile Picture Upload Logic (Appended)
// Ensure this runs after DOM content loaded or call it in init
function setupProfileUpload() {
    const profilePicWrapper = document.getElementById('profilePicWrapper');
    const profileUpload = document.getElementById('profileUpload');
    const headerProfilePic = document.getElementById('headerProfilePic');

    if (profilePicWrapper && profileUpload) {
        profilePicWrapper.addEventListener('click', () => {
            profileUpload.click();
        });

        profileUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            // Show loading state
            const originalSrc = headerProfilePic.src;
            headerProfilePic.src = 'assets/loading-spinner.gif'; // Optional: placeholder for loading

            try {
                const token = localStorage.getItem('auth_token');
                // Use absolute url for safety
                const uploadResponse = await fetch(`${API_BASE_URL}/users/${currentUser.id}/profile-picture`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (uploadResponse.ok) {
                    const result = await uploadResponse.json();
                    window.hospitalAuth.showToast('Profile picture updated!', 'success');

                    // Update image source with timestamp to bypass cache
                    // Backend returns URL starting with /uploads/..., we prepend backend base url if needed
                    // But if we use relative path and backend serves it from same domain? 
                    // Let's assume backend returns absolute or relative path that works. 
                    // Since we added WebConfig resource handler, relative path /uploads/... works if served from backend port.
                    // But frontend is on file:// or potentially different port.
                    // We should construct full URL: http://localhost:8080 + result.profilePictureUrl

                    const fullUrl = `http://localhost:8080${result.profilePictureUrl}`;

                    headerProfilePic.src = fullUrl + '?t=' + new Date().getTime();

                    // Update user object
                    currentUser.profilePictureUrl = fullUrl;
                    localStorage.setItem('user', JSON.stringify(currentUser));

                    // Also update localStorage 'profilePictureUrl' if we store it
                    localStorage.setItem('profilePictureUrl', fullUrl);

                } else {
                    window.hospitalAuth.showToast('Failed to upload image', 'error');
                    headerProfilePic.src = originalSrc;
                }
            } catch (error) {
                console.error('Upload Error:', error);
                window.hospitalAuth.showToast('Error uploading image', 'error');
                headerProfilePic.src = originalSrc;
            }
        });
    }

    // Initial Load check
    const storedPic = localStorage.getItem('profilePictureUrl') || currentUser.profilePictureUrl;
    if (storedPic && headerProfilePic) {
        // Check if it's a full URL or needs prefix
        if (storedPic.startsWith('http')) {
            headerProfilePic.src = storedPic;
        } else {
            headerProfilePic.src = `http://localhost:8080${storedPic}`;
        }
    }
}

// Call setup in init
// We can overwrite the DOMContentLoaded listener or just append this call
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init ...
    setupProfileUpload();
});

function populateDoctors(doctors) {
    const select = document.getElementById('doctorSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Choose a doctor...</option>';
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `${doctor.fullName} - ${doctor.specialization}`;
        select.appendChild(option);
    });
}

// Load Appointments
async function loadAppointments() {
    if (!currentUser.id) return;

    try {
        const appointmentsUrl = `${API_BASE_URL}/appointments/patient/${currentUser.id}`;
        
        const response = await fetchWithAuth(appointmentsUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch appointments: ${response.status}`);
        }

        const apiResponse = await response.json();
        
        let appointments = [];
        if (apiResponse.data && apiResponse.data.content) {
            appointments = apiResponse.data.content;
        } else {
            appointments = apiResponse.data || apiResponse || [];
        }
        
        allAppointments = appointments;
        displayAppointments(appointments);
        updateStats(appointments);

    } catch (error) {
        console.error('❌ Error loading appointments:', error);
        const list = document.getElementById('appointmentsList');
        if (list) list.innerHTML = `<p class="empty-state">⚠️ Error: ${error.message}</p>`;
    }
}

// Display Appointments
function displayAppointments(appointments) {
    const recentList = document.getElementById('recentAppointments');
    const fullList = document.getElementById('appointmentsList');

    if (!appointments || appointments.length === 0) {
        if (recentList) {
            recentList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h4>No Appointments Found</h4>
                    <p>You don't have any scheduled appointments yet.</p>
                    <button class="btn-primary" onclick="switchSection('book-appointment')">
                        <i class="fas fa-calendar-plus"></i>
                        Book Your First Appointment
                    </button>
                </div>
            `;
        }
        if (fullList) {
            fullList.innerHTML = '<p class="empty-state">No appointments found</p>';
        }
        return;
    }

    // Sort by date (upcoming first, then past)
    const now = new Date();
    const upcoming = appointments.filter(apt => new Date(apt.appointmentDate + ' ' + (apt.appointmentTime || '00:00')) > now);
    const past = appointments.filter(apt => new Date(apt.appointmentDate + ' ' + (apt.appointmentTime || '00:00')) <= now);

    const sorted = [...upcoming.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)),
    ...past.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))];

    // Recent items (limit to 3)
    if (recentList) {
        const recent = sorted.slice(0, 3);
        recentList.innerHTML = recent.map(apt => {
            const aptDate = new Date(apt.appointmentDate);
            const aptTime = apt.appointmentTime || '00:00';
            const isUpcoming = new Date(apt.appointmentDate + ' ' + aptTime) > now;
            const statusClass = isUpcoming ? 'upcoming' : apt.status.toLowerCase();

            return `
                <div class="appointment-item enhanced" data-id="${apt.id}">
                    <div class="apt-left">
                        <div class="apt-avatar">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <div class="apt-details">
                            <h4>${apt.doctorName || 'Dr. Unknown'}</h4>
                            <p class="apt-specialty">${apt.doctorSpecialization || 'General Practice'}</p>
                            <p class="apt-datetime">
                                <i class="fas fa-calendar-alt"></i>
                                ${aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <p class="apt-time">
                                <i class="fas fa-clock"></i>
                                ${aptTime}
                            </p>
                        </div>
                    </div>
                    <div class="apt-right">
                        <span class="apt-status-badge ${statusClass}">
                            ${isUpcoming ? '<i class="fas fa-check-circle"></i> Upcoming' : apt.status}
                        </span>
                        <div class="apt-actions">
                            <button class="apt-action-btn reschedule" title="Reschedule" onclick="rescheduleAppointment(${apt.id})">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="apt-action-btn cancel" title="Cancel" onclick="cancelAppointment(${apt.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Full list
    if (fullList) {
        fullList.innerHTML = `
            <div class="appointments-table-wrapper">
                <table class="appointments-table professional">
                    <thead>
                        <tr>
                            <th>Doctor</th>
                            <th>Date & Time</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sorted.map(apt => {
            const aptDate = new Date(apt.appointmentDate);
            const aptTime = apt.appointmentTime || '00:00';
            const isUpcoming = new Date(apt.appointmentDate + ' ' + aptTime) > now;
            const statusClass = isUpcoming ? 'upcoming' : apt.status.toLowerCase();

            return `
                                <tr class="appointment-row">
                                    <td class="doctor-cell">
                                        <div class="doctor-info">
                                            <div class="doctor-avatar">
                                                <i class="fas fa-user-md"></i>
                                            </div>
                                            <div>
                                                <div class="doctor-name">${apt.doctorName || 'Dr. Unknown'}</div>
                                                <div class="doctor-specialty">${apt.doctorSpecialization || 'General Practice'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="datetime-cell">
                                        <div class="datetime-content">
                                            <div class="date">${aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div class="time"><i class="fas fa-clock"></i> ${aptTime}</div>
                                        </div>
                                    </td>
                                    <td class="type-cell">${apt.appointmentType || 'Consultation'}</td>
                                    <td class="status-cell">
                                        <span class="status-badge ${statusClass}">
                                            ${isUpcoming ? '<i class="fas fa-check-circle"></i> Upcoming' : apt.status}
                                        </span>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="action-icon reschedule" title="Reschedule" onclick="rescheduleAppointment(${apt.id})">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                        <button class="action-icon cancel" title="Cancel" onclick="cancelAppointment(${apt.id})">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Update Stats
function updateStats(appointments) {
    const upcoming = appointments.filter(apt => apt.status === 'SCHEDULED' || apt.status === 'PENDING').length;
    
    // Calculate unique doctors
    const uniqueDoctorNames = new Set();
    appointments.forEach(apt => {
        if (apt.doctorName) {
            uniqueDoctorNames.add(apt.doctorName);
        }
    });

    const medicalRecordsCount = (allMedicalRecords && allMedicalRecords.length) || 0;

    // Use animated numbers from enhancements.js
    if (window.animateNumber) {
        animateNumber(document.getElementById('upcomingCount'), upcoming);
        animateNumber(document.getElementById('myDoctorsCount'), uniqueDoctorNames.size);
        animateNumber(document.getElementById('medicalRecordsCount'), medicalRecordsCount);
    } else {
        const upcomingEl = document.getElementById('upcomingCount');
        if (upcomingEl) upcomingEl.textContent = upcoming;
        
        const myDoctorsEl = document.getElementById('myDoctorsCount');
        if (myDoctorsEl) myDoctorsEl.textContent = uniqueDoctorNames.size;
        
        const medicalRecordsEl = document.getElementById('medicalRecordsCount');
        if (medicalRecordsEl) medicalRecordsEl.textContent = medicalRecordsCount;
    }
}

// Book Appointment Form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const doctorId = document.getElementById('doctorSelect').value;
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const reason = document.getElementById('reason').value;

        if (!doctorId || !date || !time) {
            window.hospitalAuth?.showToast('Please fill all required fields', 'error');
            return;
        }

        const payload = {
            patientId: parseInt(currentUser.id),
            doctorId: parseInt(doctorId),
            date: date,
            time: time,
            reason: reason,
            type: 'CONSULTATION'
        };

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                window.hospitalAuth?.showToast('Appointment booked successfully!', 'success');
                bookingForm.reset();
                loadAppointments();
                switchSection('appointments');
            } else {
                const apiResponse = await response.json();
                const err = apiResponse.data || apiResponse;
                throw new Error(err.message || err.error || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            window.hospitalAuth?.showToast(error.message, 'error');
        }
    });
}


// Cancel Appointment
async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/appointments/${id}/cancel`, {
            method: 'PATCH'
        });

        if (response.ok) {
            window.hospitalAuth?.showToast('Appointment cancelled', 'success');
            loadAppointments();
        } else {
            throw new Error('Failed to cancel');
        }
    } catch (error) {
        window.hospitalAuth?.showToast('Could not cancel appointment', 'error');
    }
}
window.cancelAppointment = cancelAppointment;


// Load Medical Records
async function loadMedicalRecords() {
    const listContainer = document.getElementById('recordsList');
    if (!listContainer) return;

    try {
        // Show skeleton loader
        listContainer.innerHTML = `
            <div class="skeleton-table">
                ${Array(3).fill(0).map(() => `<div class="skeleton-table-row skeleton"></div>`).join('')}
            </div>
        `;

        const response = await fetchWithAuth(`${API_BASE_URL}/medical-records/patient/${currentUser.id}`);

        if (!response.ok) throw new Error('Failed to load records');

        const apiResponse = await response.json();
        const records = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);
        allMedicalRecords = records;

        if (records.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No medical records found.</p>';
            return;
        }

        listContainer.innerHTML = records.map(record => `
            <div class="record-card" style="background:white; padding:1.5rem; border-radius:0.5rem; border:1px solid #e2e8f0; margin-bottom:1rem; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid #f1f5f9; padding-bottom:0.5rem;">
                    <div>
                        <h4 style="color:var(--text-dark); margin-bottom:0.25rem;">${record.diagnosis}</h4>
                        <small style="color:var(--text-light);"><i class="fas fa-user-md"></i> Dr. ${record.doctor?.fullName || 'Unknown'}</small>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:0.875rem; color:var(--text-light);">${new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    <div>
                        <strong style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--text-light); margin-bottom:0.25rem;">Prescription</strong>
                        <p style="white-space:pre-wrap; color:var(--text-dark); background:#f8fafc; padding:0.5rem; border-radius:0.25rem;">${record.prescription}</p>
                    </div>
                    <div>
                        <strong style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--text-light); margin-bottom:0.25rem;">Notes</strong>
                        <p style="white-space:pre-wrap; color:var(--text-dark);">${record.notes || '--'}</p>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading records:', error);
        listContainer.innerHTML = '<p class="error-state">Could not load medical records.</p>';
    }
}

// ===== PRESCRIPTIONS SECTION =====

/**
 * Load prescriptions from API
 */
async function loadPrescriptions() {
    if (!currentUser.id) return;

    const list = document.getElementById('prescriptionsList');
    if (list) {
        list.innerHTML = `
            <div class="skeleton-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem;">
                ${Array(3).fill(0).map(() => `<div class="skeleton-card skeleton" style="height:250px;"></div>`).join('')}
            </div>
        `;
    }

    try {
        if (MOCK_MODE) {
            // Mock prescription data
            const mockPrescriptions = [
                {
                    id: 1,
                    doctor: { id: 1, fullName: 'Dr. Rahul Singh Kushwhaha', specialization: 'Cardiologist' },
                    medicines: [
                        { name: 'Aspirin', dosage: '100mg', frequency: 'Once daily', days: 30 },
                        { name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', days: 30 }
                    ],
                    instructions: 'Take after meals. Avoid alcohol.',
                    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'ACTIVE'
                },
                {
                    id: 2,
                    doctor: { id: 2, fullName: 'Dr. John Smith', specialization: 'General Physician' },
                    medicines: [
                        { name: 'Cough Syrup', dosage: '10ml', frequency: 'Three times daily', days: 7 }
                    ],
                    instructions: 'Shake well before use.',
                    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    expiryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'EXPIRED'
                }
            ];
            allPrescriptions = mockPrescriptions;
            displayPrescriptions(mockPrescriptions);
            return;
        }

        const response = await fetchWithAuth(`${API_BASE_URL}/prescriptions/patient/${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch prescriptions');

        const apiResponse = await response.json();
        const prescriptions = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);
        allPrescriptions = prescriptions;
        displayPrescriptions(prescriptions);

    } catch (error) {
        console.error('Error loading prescriptions:', error);
        const list = document.getElementById('prescriptionsList');
        if (list) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-prescription-bottle-alt"></i>
                    <h4>No Prescriptions Found</h4>
                    <p>You don't have any prescriptions at the moment.</p>
                </div>
            `;
        }
    }
}

/**
 * Display prescriptions in grid format
 */
function displayPrescriptions(prescriptions) {
    const list = document.getElementById('prescriptionsList');
    if (!list) return;

    if (!prescriptions || prescriptions.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-prescription-bottle-alt"></i>
                <h4>No Prescriptions Found</h4>
                <p>You don't have any prescriptions at the moment.</p>
            </div>
        `;
        return;
    }

    // Sort by creation date (newest first)
    const sorted = [...prescriptions].sort((a, b) =>
        new Date(b.createdDate) - new Date(a.createdDate)
    );

    list.innerHTML = sorted.map(rx => {
        const createdDate = new Date(rx.createdDate);
        const expiryDate = new Date(rx.expiryDate);
        const isActive = expiryDate > new Date();
        const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

        return `
            <div class="prescription-card-item ${isActive ? 'active' : 'expired'}">
                <div class="rx-header">
                    <div class="rx-doctor-info">
                        <div class="rx-doctor-avatar">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <div>
                            <h4>${rx.doctor?.fullName || 'Unknown Doctor'}</h4>
                            <p class="rx-specialty">${rx.doctor?.specialization || 'Specialist'}</p>
                        </div>
                    </div>
                    <div class="rx-status">
                        <span class="rx-status-badge ${isActive ? 'active' : 'expired'}">
                            ${isActive ? \`<i class="fas fa-check-circle"></i> Active\` : '<i class="fas fa-times-circle"></i> Expired'}
                        </span>
                    </div>
                </div>

                <div class="rx-dates">
                    <div class="rx-date-item">
                        <span class="date-label">Issued</span>
                        <span class="date-value">\${createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div class="rx-date-item">
                        <span class="date-label">Expires</span>
                        <span class="date-value">\${expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    \${isActive ? \`
                        <div class="rx-date-item">
                            <span class="date-label">Days Left</span>
                            <span class="date-value highlight">\${daysLeft} days</span>
                        </div>
                    \` : ''}
                </div>

                <div class="rx-medicines">
                    <h5>Medicines</h5>
                    <div class="medicine-list">
                        \${rx.medicines ? rx.medicines.map(med => \`
                            <div class="medicine-item">
                                <div class="medicine-name">\${med.name}</div>
                                <div class="medicine-details">
                                    <span class="dosage"><i class="fas fa-capsules"></i> \${med.dosage}</span>
                                    <span class="frequency"><i class="fas fa-clock"></i> \${med.frequency}</span>
                                    <span class="duration"><i class="fas fa-calendar"></i> \${med.days} days</span>
                                </div>
                            </div>
                        \`).join('') : '<p>No medicines listed</p>'}
                    </div>
                </div>

                \${rx.instructions ? \`
                    <div class="rx-instructions">
                        <h5>Instructions</h5>
                        <p>\${rx.instructions}</p>
                    </div>
                \` : ''}

                <div class="rx-actions">
                    <button class="rx-action-btn view" onclick="viewPrescriptionDetails(\${rx.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                        <span>View</span>
                    </button>
                    <button class="rx-action-btn download" onclick="downloadPrescription(\${rx.id})" title="Download PDF">
                        <i class="fas fa-download"></i>
                        <span>Download</span>
                    </button>
                    <button class="rx-action-btn print" onclick="printPrescription(\${rx.id})" title="Print">
                        <i class="fas fa-print"></i>
                        <span>Print</span>
                    </button>
                </div>
            </div>
        \`;
    }).join('');
}

/**
 * View prescription details
 */
function viewPrescriptionDetails(prescriptionId) {
    window.hospitalAuth?.showToast(\`Opening prescription \${prescriptionId}...\`, 'info');
    console.log('View prescription:', prescriptionId);
}
window.viewPrescriptionDetails = viewPrescriptionDetails;

/**
 * Download single prescription
 */
function downloadPrescription(prescriptionId) {
    try {
        const link = document.createElement('a');
        link.href = \`\${API_BASE_URL}/prescriptions/\${prescriptionId}/download\`;
        link.download = \`prescription_\${prescriptionId}_\${new Date().getTime()}.pdf\`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.hospitalAuth?.showToast('Prescription downloaded successfully!', 'success');
        console.log('Downloaded prescription:', prescriptionId);
    } catch (error) {
        console.error('Download prescription error:', error);
        window.hospitalAuth?.showToast('Failed to download prescription', 'error');
    }
}
window.downloadPrescription = downloadPrescription;

/**
 * Download all prescriptions
 */
function downloadAllPrescriptions() {
    try {
        const userId = localStorage.getItem('auth_userId');
        const link = document.createElement('a');
        link.href = \`\${API_BASE_URL}/prescriptions/patient/\${userId}/download-all\`;
        link.download = \`all_prescriptions_\${new Date().getTime()}.zip\`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.hospitalAuth?.showToast('All prescriptions downloaded successfully!', 'success');
        console.log('Downloaded all prescriptions for user:', userId);
    } catch (error) {
        console.error('Download all prescriptions error:', error);
        window.hospitalAuth?.showToast('Failed to download prescriptions', 'error');
    }
}
window.downloadAllPrescriptions = downloadAllPrescriptions;

/**
 * Print prescription
 */
function printPrescription(prescriptionId) {
    try {
        const printWindow = window.open(\`\${API_BASE_URL}/prescriptions/\${prescriptionId}/print\`, '_blank');
        printWindow.print();
        window.hospitalAuth?.showToast('Opening prescription for printing...', 'info');
    } catch (error) {
        console.error('Print prescription error:', error);
        window.hospitalAuth?.showToast('Failed to print prescription', 'error');
    }
}
window.printPrescription = printPrescription;

// Load Bills
async function loadBills() {
    const billsList = document.getElementById('billsList');
    if (!billsList) return;

    try {
        // Show skeleton table
        billsList.innerHTML = \`
            <div class="skeleton-table">
                \${Array(4).fill(0).map(() => \`<div class="skeleton-table-row skeleton"></div>\`).join('')}
            </div>
        \`;

        const response = await fetchWithAuth(\`\${API_BASE_URL}/bills/patient/\${currentUser.id}\`);

        if (!response.ok) throw new Error('Failed to load bills');

        const apiResponse = await response.json();
        const bills = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse || []);

        if (!bills || bills.length === 0) {
            billsList.innerHTML = '<p class="empty-state">No billing records found</p>';
            updateBillsStats(0);
            return;
        }

        // Calculate total pending bills
        const pendingAmount = bills
            .filter(bill => bill.status === 'PENDING' || bill.status === 'UNPAID')
            .reduce((sum, bill) => sum + (bill.amount || 0), 0);

        updateBillsStats(pendingAmount);

        billsList.innerHTML = \`
            <table class="bills-table" style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
                        <th style="padding: 1rem; text-align: left;">Bill ID</th>
                        <th style="padding: 1rem; text-align: left;">Description</th>
                        <th style="padding: 1rem; text-align: right;">Amount</th>
                        <th style="padding: 1rem; text-align: center;">Status</th>
                        <th style="padding: 1rem; text-align: center;">Date</th>
                        <th style="padding: 1rem; text-align: center;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    \${bills.map(bill => \`
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 1rem;">#\${bill.id}</td>
                            <td style="padding: 1rem;">\${bill.description || 'Medical Services'}</td>
                            <td style="padding: 1rem; text-align: right; font-weight: 600;">₹\${bill.amount?.toLocaleString()}</td>
                            <td style="padding: 1rem; text-align: center;">
                                <span class="status-badge \${bill.status?.toLowerCase()}">\${bill.status}</span>
                            </td>
                            <td style="padding: 1rem; text-align: center;">\${new Date(bill.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td style="padding: 1rem; text-align: center;">
                                \${bill.status !== 'PAID' ? \`
                                    <button class="btn-pay" onclick="payBill(\${bill.id}, \${bill.amount})">
                                        <i class="fas fa-credit-card"></i> Pay Now
                                    </button>
                                \` : '<span style="color: #28a745;">✓ Paid</span>'}
                            </td>
                        </tr>
                    \`).join('')}
                </tbody>
            </table>
        \`;

    } catch (error) {
        console.error('Error loading bills:', error);
        billsList.innerHTML = '<p class="error-state">Could not load billing records.</p>';
        updateBillsStats(0);
    }
}

// Update Bills Statistics
function updateBillsStats(pendingAmount) {
    const pendingBillsEl = document.getElementById('pendingBillsCount');
    if (!pendingBillsEl) return;

    if (window.animateNumber) {
        // Since this might have a currency symbol, we might need to handle it
        // Or just animate the number and add the symbol back
        animateNumber(pendingBillsEl, pendingAmount, '₹');
    } else {
        pendingBillsEl.textContent = `₹${pendingAmount.toLocaleString()}`;
    }
}

// Pay Bill Function
async function payBill(billId, amount) {
    if (!confirm(`Proceed to pay ₹${amount.toLocaleString()}?`)) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/bills/${billId}/pay`, {
            method: 'POST',
            body: JSON.stringify({
                amount: amount,
                paymentMethod: 'ONLINE',
                notes: 'Paid via Patient Portal'
            })
        });

        if (response.ok) {
            window.hospitalAuth?.showToast('Payment successful!', 'success');
            loadBills(); // Reload bills
        } else {
            throw new Error('Payment failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        window.hospitalAuth?.showToast('Payment failed. Please try again.', 'error');
    }
}
window.payBill = payBill;

// ===== QUICK ACTIONS FUNCTIONS =====

/**
 * Quick Action: Download Prescription (from quick actions, not prescription card)
 */
function quickActionDownloadPrescription() {
    try {
        const userId = localStorage.getItem('auth_userId');
        if (!userId) {
            window.hospitalAuth?.showToast('User ID not found', 'error');
            return;
        }

        window.hospitalAuth?.showToast('Downloading latest prescription...', 'info');

        // Create download link
        const link = document.createElement('a');
        link.href = `${API_BASE_URL}/patients/${userId}/prescription/download`;
        link.download = `prescription_${userId}_${new Date().getTime()}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.hospitalAuth?.showToast('Prescription downloaded successfully!', 'success');
        console.log('Prescription download initiated');
    } catch (error) {
        console.error('Quick action download error:', error);
        window.hospitalAuth?.showToast('Failed to download prescription', 'error');
    }
}
window.quickActionDownloadPrescription = quickActionDownloadPrescription;

/**
 * Quick Action: Schedule Follow-up
 */
function quickActionScheduleFollowUp() {
    try {
        window.hospitalAuth?.showToast('Opening follow-up appointment form...', 'info');

        // Switch to book appointment section
        switchSection('book-appointment');

        // Populate with follow-up context
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            const heading = document.querySelector('#book-appointment .card-header h3');
            if (heading) heading.textContent = 'Schedule Follow-up Appointment';

            const reasonField = document.getElementById('reason');
            if (reasonField) {
                reasonField.value = 'Follow-up appointment from previous consultation';
                reasonField.focus();
            }

            // Scroll to form
            bookingForm.scrollIntoView({ behavior: 'smooth' });
        }

        console.log('Follow-up appointment form opened');
    } catch (error) {
        console.error('Quick action follow-up error:', error);
        window.hospitalAuth?.showToast('Failed to open follow-up form', 'error');
    }
}
window.quickActionScheduleFollowUp = quickActionScheduleFollowUp;

/**
 * Quick Action: Request Lab Test
 */
function quickActionRequestLabTest() {
    try {
        window.hospitalAuth?.showToast('Opening lab test request form...', 'info');

        // Create a modal for lab test request
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'labTestModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-flask"></i> Request Lab Test</h3>
                    <button class="close-btn" onclick="closeModal('labTestModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="labTestForm" onsubmit="submitLabTest(event)">
                        <div class="form-group">
                            <label>Test Type <span class="required">*</span></label>
                            <select id="testType" required>
                                <option value="">Select a test...</option>
                                <option value="BLOOD_TEST">Blood Test</option>
                                <option value="COVID_TEST">COVID-19 Test</option>
                                <option value="THYROID_TEST">Thyroid Test</option>
                                <option value="URINE_TEST">Urine Test</option>
                                <option value="CHEST_XRAY">Chest X-Ray</option>
                                <option value="ECG">ECG Test</option>
                                <option value="ULTRASOUND">Ultrasound</option>
                                <option value="CT_SCAN">CT Scan</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Test Reason</label>
                            <textarea id="testReason" rows="3" placeholder="Reason for requesting this test..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Preferred Date</label>
                            <input type="date" id="testDate" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('labTestModal')">Cancel</button>
                            <button type="submit" class="btn-primary">Request Test</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remove if already exists
        const existing = document.getElementById('labTestModal');
        if (existing) existing.remove();

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Set minimum date to today
        const testDateInput = document.getElementById('testDate');
        const today = new Date().toISOString().split('T')[0];
        testDateInput.min = today;

        console.log('Lab test request form opened');
    } catch (error) {
        console.error('Quick action lab test error:', error);
        window.hospitalAuth?.showToast('Failed to open lab test form', 'error');
    }
}
window.quickActionRequestLabTest = quickActionRequestLabTest;

/**
 * Submit lab test request
 */
async function submitLabTest(event) {
    event.preventDefault();

    try {
        const testType = document.getElementById('testType').value;
        const testReason = document.getElementById('testReason').value;
        const testDate = document.getElementById('testDate').value;
        const userId = localStorage.getItem('auth_userId');

        if (!testType || !testDate) {
            window.hospitalAuth?.showToast('Please fill all required fields', 'warning');
            return;
        }

        const labTestData = {
            userId,
            testType,
            reason: testReason || 'Lab test requested through patient portal',
            requestedDate: testDate,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        const response = await fetchWithAuth(`${API_BASE_URL}/patients/${userId}/lab-tests`, {
            method: 'POST',
            body: JSON.stringify(labTestData)
        });

        if (response.ok) {
            const apiResponse = await response.json();
            const result = apiResponse.data || apiResponse;
            window.hospitalAuth?.showToast('Lab test request submitted successfully!', 'success');
            closeModal('labTestModal');
            console.log('Lab test request submitted:', result);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Submit lab test error:', error);
        window.hospitalAuth?.showToast('Failed to submit lab test request', 'error');
    }
}
window.submitLabTest = submitLabTest;

/**
 * Close modal dialog
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}
window.closeModal = closeModal;

/**
 * Reschedule an appointment
 */
function rescheduleAppointment(appointmentId) {
    try {
        window.hospitalAuth?.showToast('Opening reschedule form...', 'info');

        // Store appointment ID for rescheduling
        sessionStorage.setItem('appointmentToReschedule', appointmentId);

        // Switch to booking section with reschedule mode
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            const heading = document.querySelector('#book-appointment .card-header h3');
            if (heading) heading.textContent = 'Reschedule Appointment';

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Reschedule Appointment';
            }
        }

        switchSection('book-appointment');
    } catch (error) {
        console.error('Reschedule error:', error);
        window.hospitalAuth?.showToast('Failed to open reschedule form', 'error');
    }
}
window.rescheduleAppointment = rescheduleAppointment;

/**
 * Cancel an appointment
 */
function cancelAppointment(appointmentId) {
    // Confirmation dialog
    const confirmed = confirm('Are you sure you want to cancel this appointment? This action cannot be undone.');

    if (!confirmed) return;

    try {
        const userId = localStorage.getItem('auth_userId');

        // Simulate cancel (in production, call backend)
        if (MOCK_MODE) {
            window.hospitalAuth?.showToast('Appointment cancelled successfully!', 'success');
            loadAppointments();
            return;
        }

        // Make API call to cancel
        fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                window.hospitalAuth?.showToast('Appointment cancelled successfully!', 'success');
                loadAppointments();
            } else {
                throw new Error('Failed to cancel appointment');
            }
        }).catch(error => {
            console.error('Cancel appointment error:', error);
            window.hospitalAuth?.showToast('Failed to cancel appointment. Please try again.', 'error');
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        window.hospitalAuth?.showToast('An error occurred', 'error');
    }
}
window.cancelAppointment = cancelAppointment;
// ===== PHASE 1: DARK MODE, NOTIFICATIONS, BREADCRUMB =====

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');

    if (theme === 'dark') {
        html.classList.add('dark-mode');
        body.classList.add('dark-mode');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.remove('dark-mode');
        body.classList.remove('dark-mode');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

window.toggleTheme = toggleTheme;

// Notification Management
function addNotification(type, title, message, duration = 5000) {
    const notification = {
        id: Date.now(),
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

window.clearAllNotifications = clearAllNotifications;

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = notificationBadgeCount > 9 ? '9+' : notificationBadgeCount;
        badge.style.display = notificationBadgeCount > 0 ? 'flex' : 'none';
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = '<p class="empty-notification">No notifications</p>';
        return;
    }

    list.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}">
            <div class="notification-icon ${notif.type}">
                <i class="fas ${getNotificationIcon(notif.type)}"></i>
            </div>
            <div class="notification-content">
                <p class="notification-title">${notif.title}</p>
                <p class="notification-text">${notif.message}</p>
                <p class="notification-time">${notif.timestamp}</p>
            </div>
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    const icons = {
        appointment: 'fa-calendar-check',
        prescription: 'fa-prescription-bottle-alt',
        test: 'fa-flask',
        bill: 'fa-receipt',
        message: 'fa-envelope'
    };
    return icons[type] || 'fa-bell';
}

function toggleNotifications(event) {
    event.stopPropagation();
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            document.addEventListener('click', function closeNotifications(e) {
                if (!e.target.closest('.notification-container')) {
                    panel.classList.remove('active');
                    document.removeEventListener('click', closeNotifications);
                }
            });
        }
    }
}

window.toggleNotifications = toggleNotifications;

// Initialize sample notifications
function initializeSampleNotifications() {
    addNotification('appointment', 'Upcoming Appointment', 'Your appointment with Dr. Sarah Johnson is in 2 hours', 0);
    addNotification('prescription', 'Prescription Due', 'Your blood pressure medication needs refill', 0);
}

// Update breadcrumb based on current section
function updateBreadcrumb(sectionId) {
    const breadcrumbMap = {
        'overview': 'Overview',
        'appointments': 'Appointments',
        'book-appointment': 'Book Appointment',
        'medical-records': 'Medical Records',
        'prescriptions': 'Prescriptions',
        'billing': 'Billing',
        'messages': 'Messages'
    };

    const current = document.getElementById('breadcrumbCurrent');
    if (current) {
        current.textContent = breadcrumbMap[sectionId] || 'Dashboard';
    }
}

// ===== PHASE 3: SEARCH & FILTER FUNCTIONALITY =====

let allAppointments = [];
let allPrescriptions = [];
let allMedicalRecords = [];

function filterAppointments() {
    const searchInput = document.getElementById('appointmentSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('appointmentStatus')?.value || '';
    const sortBy = document.getElementById('appointmentSort')?.value || 'date-desc';

    let filtered = allAppointments.filter(appt => {
        const doctorMatch = appt.doctor?.name.toLowerCase().includes(searchInput) || '';
        const statusMatch = !statusFilter || appt.status === statusFilter;
        return doctorMatch && statusMatch;
    });

    // Sort
    filtered.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return sortBy === 'date-asc' ? dateA - dateB : dateB - dateA;
    });

    renderFilteredAppointments(filtered);
}

function filterPrescriptions() {
    const searchInput = document.getElementById('prescriptionSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('prescriptionStatus')?.value || '';
    const sortBy = document.getElementById('prescriptionSort')?.value || 'date-desc';

    let filtered = allPrescriptions.filter(presc => {
        const doctorMatch = presc.doctor?.name.toLowerCase().includes(searchInput) || false;
        const medicineMatch = presc.medicines?.some(m => m.name.toLowerCase().includes(searchInput)) || false;
        const statusMatch = !statusFilter || presc.status === statusFilter;
        return (doctorMatch || medicineMatch) && statusMatch;
    });

    // Sort
    filtered.sort((a, b) => {
        const dateA = new Date(a.issuedDate);
        const dateB = new Date(b.issuedDate);
        return sortBy === 'date-asc' ? dateA - dateB : dateB - dateA;
    });

    displayPrescriptions(filtered);
}

function filterMedicalRecords() {
    const searchInput = document.getElementById('recordSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('recordType')?.value || '';
    const sortBy = document.getElementById('recordSort')?.value || 'date-desc';

    let filtered = allMedicalRecords.filter(record => {
        const titleMatch = record.title?.toLowerCase().includes(searchInput) || false;
        const doctorMatch = record.doctor?.name.toLowerCase().includes(searchInput) || false;
        const typeMatch = !typeFilter || record.type === typeFilter;
        return (titleMatch || doctorMatch) && typeMatch;
    });

    // Sort
    filtered.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortBy === 'date-asc' ? dateA - dateB : dateB - dateA;
    });

    renderFilteredRecords(filtered);
}

function renderFilteredAppointments(filtered) {
    const list = document.getElementById('appointmentsList');
    if (!list) return;

    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-state">No appointments match your search</p>';
        return;
    }

    const upcoming = filtered.filter(a => new Date(a.date + ' ' + a.time) > new Date());
    const past = filtered.filter(a => new Date(a.date + ' ' + a.time) <= new Date());

    const html = [];

    if (upcoming.length > 0) {
        html.push('<h4 style="margin-top: 1rem; color: var(--gray-700); font-size: 0.875rem; font-weight: 600;">Upcoming</h4>');
        upcoming.forEach(appt => {
            const appointmentDate = new Date(appt.date + ' ' + appt.time);
            const isExpired = appointmentDate < new Date();

            html.push(`
                <div class="appointment-item enhanced">
                    <div class="appointment-doctor">
                        <div class="doctor-avatar">
                            ${appt.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div class="appointment-details">
                            <h4 class="doctor-name">${appt.doctor?.name || 'Unknown Doctor'}</h4>
                            <p class="doctor-specialty">${appt.doctor?.specialization || 'Specialist'}</p>
                        </div>
                    </div>
                    <div class="appointment-time">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(appt.date).toLocaleDateString()} at ${appt.time}</span>
                    </div>
                    <span class="status-badge ${appt.status}">${appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}</span>
                    <div class="appointment-actions">
                        <button type="button" onclick="window.rescheduleAppointment('${appt.id}'); return false;" class="action-btn-mini">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" onclick="window.cancelAppointment('${appt.id}'); return false;" class="action-btn-mini">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `);
        });
    }

    if (past.length > 0) {
        html.push('<h4 style="margin-top: 1.5rem; color: var(--gray-700); font-size: 0.875rem; font-weight: 600;">Past</h4>');
        past.forEach(appt => {
            html.push(`
                <div class="appointment-item enhanced">
                    <div class="appointment-doctor">
                        <div class="doctor-avatar">
                            ${appt.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div class="appointment-details">
                            <h4 class="doctor-name">${appt.doctor?.name || 'Unknown Doctor'}</h4>
                            <p class="doctor-specialty">${appt.doctor?.specialization || 'Specialist'}</p>
                        </div>
                    </div>
                    <div class="appointment-time">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(appt.date).toLocaleDateString()} at ${appt.time}</span>
                    </div>
                    <span class="status-badge completed">Completed</span>
                </div>
            `);
        });
    }

    list.innerHTML = html.join('');
}

function renderFilteredRecords(filtered) {
    const list = document.getElementById('recordsList');
    if (!list) return;

    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-state">No medical records match your search</p>';
        return;
    }

    const html = filtered.map(record => `
        <div class="record-card">
            <div class="record-header">
                <div class="record-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <i class="fas fa-file-medical"></i>
                </div>
                <div>
                    <h4 class="record-title">${record.title}</h4>
                    <p class="record-date">${new Date(record.date).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="record-doctor">
                <i class="fas fa-user-md"></i>
                <span>${record.doctor?.name || 'Unknown Doctor'}</span>
            </div>
            <p class="record-description">${record.notes || 'No description'}</p>
            <div class="record-actions">
                <button type="button" class="btn-small" onclick="downloadMedicalRecord('${record.id}'); return false;">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');

    list.innerHTML = html;
}

window.filterAppointments = filterAppointments;
window.filterPrescriptions = filterPrescriptions;
window.filterMedicalRecords = filterMedicalRecords;

// ===== NOTIFICATION SYSTEM =====

function initializeSampleNotifications() {
    updateNotificationBadge();
    simulateRealTimeNotifications();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = notificationBadgeCount;
        badge.style.display = notificationBadgeCount > 0 ? 'inline-flex' : 'none';

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
    window.hospitalAuth?.showToast(title, type);

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

// Real-Time Simulation (Patient Role)
function simulateRealTimeNotifications() {
    const patientMessages = [
        { title: 'Prescription Updated', message: 'Dr. Sarah has updated your medication plan.', type: 'info' },
        { title: 'Lab Results Ready', message: 'Your CBC blood test results are available.', type: 'success' },
        { title: 'Appointment Reminder', message: 'Remember your check-up tomorrow at 10:00 AM.', type: 'info' },
        { title: 'Bill Payment Due', message: 'Invoice #INV-2024-05 is pending payment.', type: 'warning' },
        { title: 'New Message', message: 'You have a new message from MediMate AI.', type: 'info' }
    ];

    const delay = Math.floor(Math.random() * (60000 - 30000 + 1) + 30000); // 30-60s

    setTimeout(() => {
        const randomMsg = patientMessages[Math.floor(Math.random() * patientMessages.length)];
        addNotification(randomMsg.title, randomMsg.message, randomMsg.type);
        simulateRealTimeNotifications();
    }, delay);
}

// ===== AI CLINICAL NAVIGATOR =====

async function analyzeSymptoms() {
    const input = document.getElementById('symptomInput');
    const resultDiv = document.getElementById('triageResult');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (!input.value.trim()) {
        window.hospitalAuth?.showToast('Please describe your symptoms', 'warning');
        return;
    }

    try {
        analyzeBtn.disabled = true;
        const originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        
        // Hide result while loading
        resultDiv.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/ai/triage`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ symptoms: input.value })
        });

        if (!response.ok) throw new Error('Analysis failed');

        const apiResponse = await response.json();
        const triage = apiResponse.data;

        // Display results
        resultDiv.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: var(--gray-900);">AI Analysis</h4>
                    <span class="badge" style="background: ${getUrgencyColor(triage.urgencyLevel)}; color: white; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700;">
                        ${triage.urgencyLevel} URGENCY
                    </span>
                </div>
                
                <p style="font-size: 0.85rem; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Recommended Specialist</p>
                <p style="font-size: 1.25rem; font-weight: 800; color: var(--primary-color); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-user-md"></i> ${triage.recommendedSpecialization}
                </p>
                
                <div style="background: white; padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--gray-200); font-size: 0.95rem; line-height: 1.6; color: var(--gray-700);">
                    ${triage.analysisSummary}
                </div>
            </div>
            
            <button class="btn-primary" onclick="bookWithSpecialist('${triage.recommendedSpecialization}')" style="width: 100%; background: var(--gray-900); border: none; padding: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <span>Find a ${triage.recommendedSpecialization}</span>
                <i class="fas fa-arrow-right"></i>
            </button>
        `;
        
        resultDiv.style.display = 'block';
        analyzeBtn.innerHTML = originalText;

    } catch (error) {
        console.error('Triage Error:', error);
        window.hospitalAuth?.showToast('AI analysis failed. Please try again later.', 'error');
        analyzeBtn.innerHTML = '<i class="fas fa-search-plus"></i> Analyze My Symptoms';
    } finally {
        analyzeBtn.disabled = false;
    }
}

function getUrgencyColor(level) {
    switch (level?.toUpperCase()) {
        case 'HIGH': return '#ef4444'; // Error/Red
        case 'MEDIUM': return '#f59e0b'; // Warning/Orange
        default: return '#10b981'; // Success/Green
    }
}

function bookWithSpecialist(specialization) {
    // Switch to booking section
    switchSection('book-appointment');
    
    // Find a doctor with this specialization in the select dropdown
    const doctorSelect = document.getElementById('doctorSelect');
    if (doctorSelect) {
        let found = false;
        // Search options for specialization match
        for (let i = 0; i < doctorSelect.options.length; i++) {
            const optionText = doctorSelect.options[i].textContent.toLowerCase();
            if (optionText.includes(specialization.toLowerCase())) {
                doctorSelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        
        if (!found) {
            console.log('No direct match for specialization:', specialization);
        }
    }
    
    // Pre-fill the reason field with the AI's recommendation context
    const reasonEl = document.getElementById('reason');
    const symptomInput = document.getElementById('symptomInput');
    if (reasonEl) {
        reasonEl.value = `Symptoms reported: ${symptomInput.value}\n\n[AI Recommendation: ${specialization}]`;
        reasonEl.focus();
    }
    
    // Smooth scroll to the booking section
    const bookingCard = document.querySelector('#book-appointment .card');
    if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    window.hospitalAuth?.showToast(`Filter applied for ${specialization}`, 'success');
}

// Export functions to global scope
window.analyzeSymptoms = analyzeSymptoms;
window.bookWithSpecialist = bookWithSpecialist;
window.getUrgencyColor = getUrgencyColor;
