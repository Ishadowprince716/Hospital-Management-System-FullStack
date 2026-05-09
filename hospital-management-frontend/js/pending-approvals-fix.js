// Quick Fix for Pending Approvals

// Add this to fix the error immediately
window.addEventListener('DOMContentLoaded', () => {
    console.log('Checking elements...');
    console.log('pendingApprovalsModal:', document.getElementById('pendingApprovalsModal'));
    console.log('pendingDoctorsList:', document.getElementById('pendingDoctorsList'));
    console.log('pendingCount:', document.getElementById('pendingCount'));
});

// Improved showPendingDoctors function
async function showPendingDoctorsFixed() {
    console.log('showPendingDoctors called');

    const modal = document.getElementById('pendingApprovalsModal');
    const listEl = document.getElementById('pendingDoctorsList');

    if (!modal) {
        alert('Error: Pending Approvals modal not found!');
        console.error('Modal element pendingApprovalsModal not found');
        return;
    }

    if (!listEl) {
        alert('Error: Pending doctors list element not found!');
        console.error('List element pendingDoctorsList not found');
        return;
    }

    // Show loading
    listEl.innerHTML = '<div style="padding: 2rem; text-align: center;">Loading pending approvals...</div>';

    // Open modal immediately
    modal.classList.add('show');

    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No auth token found');
        }

        console.log('Fetching users...');
        const response = await fetch('http://localhost:8080/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const apiResponse = await response.json().catch(() => ({}));
            const err = apiResponse.data || apiResponse;
            throw new Error(err.message || err.error || `HTTP error! status: ${response.status}`);
        }

        const apiResponse = await response.json();
        const allUsers = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse);
        console.log('All users:', Array.isArray(allUsers) ? allUsers.length : 'not an array');

        const pendingDoctors = Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'DOCTOR' && !u.isActive) : [];
        console.log('Pending doctors:', pendingDoctors.length);

        // Update badge
        const badge = document.getElementById('pendingCount');
        if (badge) {
            badge.textContent = pendingDoctors.length;
        }

        if (pendingDoctors.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem; display: block;"></i>
                    <h3>No Pending Approvals</h3>
                    <p style="color: #6b7280;">All doctor registrations have been reviewed!</p>
                </div>
            `;
        } else {
            const cards = pendingDoctors.map(doc => `
                <div style="padding: 1.25rem; background: #f9fafb; border-radius: 0.75rem; margin-bottom: 1rem; border-left: 4px solid #fbbf24;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.5rem 0;">${doc.fullName || doc.username}</h4>
                            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">${doc.specialization || 'General Physician'}</p>
                            <div style="margin-top: 0.75rem; font-size: 0.875rem;">
                                <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${doc.email}</p>
                                <p style="margin: 0.25rem 0;"><strong>Phone:</strong> ${doc.phoneNumber || 'N/A'}</p>
                                <p style="margin: 0.25rem 0;"><strong>Experience:</strong> ${doc.experienceYears || 0} years</p>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-left: 1rem;">
                            <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem; white-space: nowrap;" onclick="approveDoctor(${doc.id})">
                                ✓ Approve
                            </button>
                            <button class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: #ef4444; color: white; border-color: #ef4444; white-space: nowrap;" onclick="rejectDoctor(${doc.id})">
                                ✗ Reject
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            listEl.innerHTML = cards;
        }

    } catch (error) {
        console.error('Error:', error);
        listEl.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Error Loading Pending Approvals</h3>
                <p style="color: #6b7280;">${error.message}</p>
                <button class="btn-primary" style="margin-top: 1rem;" onclick="showPendingDoctorsFixed()">
                    Retry
                </button>
            </div>
        `;
    }
}

// Replace the global function
window.showPendingDoctors = showPendingDoctorsFixed;

console.log('Pending approvals fix loaded!');
