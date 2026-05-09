// Patient Bills & Payments JavaScript
const API_BASE_URL = 'http://localhost:8080/api';
let allBills = [];
let currentBill = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadPatientData();
    updateDateTime();
    loadBills();
    setupEventListeners();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('auth_role');

    if (!token || role !== 'PATIENT') {
        window.location.href = 'index.html';
    }
}

// Load Patient Data
function loadPatientData() {
    const fullName = localStorage.getItem('auth_fullName');
    const username = localStorage.getItem('auth_username');

    const patientNameEl = document.getElementById('patientName');
    if (patientNameEl) {
        patientNameEl.textContent = fullName || username || 'Patient';
    }
}

// Update Date Time
function updateDateTime() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Load Bills
async function loadBills() {
    try {
        const token = localStorage.getItem('auth_token');
        const patientId = localStorage.getItem('auth_userId');

        const response = await fetch(`${API_BASE_URL}/bills/patient/${patientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const apiResponse = await response.json();
            // Handle ApiResponse wrapper and pagination
            if (apiResponse.success) {
                // If it's a Page object from Spring Data
                if (apiResponse.data && apiResponse.data.content) {
                    allBills = apiResponse.data.content;
                } else {
                    allBills = apiResponse.data || [];
                }
            } else {
                console.error('API Error:', apiResponse.message);
                allBills = generateMockBills();
            }
        } else {
            console.error('HTTP Error:', response.status);
            allBills = generateMockBills();
        }

        displayBills(allBills);
        updateSummary();

    } catch (error) {
        console.error('Error loading bills:', error);
        allBills = generateMockBills();
        displayBills(allBills);
        updateSummary();
    }
}

// Generate Mock Bills (for testing)
function generateMockBills() {
    const patientName = localStorage.getItem('fullName') || 'Patient';
    return [
        {
            id: 1,
            billDate: new Date(Date.now() - 86400000 * 5).toISOString(),
            description: 'Consultation Fee - General Checkup',
            doctorName: 'Dr. Rajesh Kumar',
            amount: 500,
            status: 'PAID',
            paymentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
            paymentMethod: 'Card'
        },
        {
            id: 2,
            billDate: new Date(Date.now() - 86400000 * 3).toISOString(),
            description: 'Blood Test - Complete Blood Count',
            doctorName: 'Dr. Priya Sharma',
            amount: 800,
            status: 'PENDING',
            paymentDate: null,
            paymentMethod: null
        },
        {
            id: 3,
            billDate: new Date(Date.now() - 86400000 * 1).toISOString(),
            description: 'Consultation Fee - Follow-up',
            doctorName: 'Dr. Amit Verma',
            amount: 300,
            status: 'PENDING',
            paymentDate: null,
            paymentMethod: null
        }
    ];
}

// Display Bills
function displayBills(bills) {
    const tbody = document.getElementById('billsTableBody');

    if (!bills || bills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No bills found</td></tr>';
        return;
    }

    tbody.innerHTML = bills.map(bill => {
        // Handle real model fields vs mock fields
        const date = bill.billDate || bill.generatedAt;
        const description = bill.description || (bill.items && bill.items.length > 0 ? bill.items[0].description : 'Medical Services');
        const doctorName = bill.doctorName || (bill.appointment && bill.appointment.doctor ? bill.appointment.doctor.fullName : 'N/A');
        const amount = bill.amount;
        const status = bill.status || 'PENDING';

        return `
        <tr>
            <td>#${bill.billNumber || bill.id}</td>
            <td>${date ? new Date(date).toLocaleDateString() : 'N/A'}</td>
            <td>${description}</td>
            <td>${doctorName}</td>
            <td style="font-weight: 600; color: var(--gray-900);">₹${amount}</td>
            <td>
                <span class="status-badge ${status.toLowerCase()}">${status}</span>
            </td>
            <td class="actions">
                <button class="btn-icon" onclick="viewBillDetails(${bill.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${status === 'PENDING' || status === 'PARTIAL' ? `
                <button class="btn-icon" style="background: var(--primary-color); color: white; border-color: var(--primary-color);" onclick="showPaymentModal(${bill.id})" title="Pay Now">
                    <i class="fas fa-credit-card"></i>
                </button>` : ''}
            </td>
        </tr>
    `;
    }).join('');
}

// Update Summary
function updateSummary() {
    const total = allBills.reduce((sum, bill) => sum + bill.amount, 0);
    const paid = allBills.filter(b => b.status === 'PAID').reduce((sum, bill) => sum + bill.amount, 0);
    const pending = allBills.filter(b => b.status === 'PENDING').reduce((sum, bill) => sum + bill.amount, 0);

    document.getElementById('totalBills').textContent = `₹${total}`;
    document.getElementById('paidBills').textContent = `₹${paid}`;
    document.getElementById('pendingBills').textContent = `₹${pending}`;
}

// Show Payment Modal
function showPaymentModal(billId) {
    currentBill = allBills.find(b => b.id === billId);
    if (!currentBill) return;

    const description = currentBill.description || (currentBill.items && currentBill.items.length > 0 ? currentBill.items[0].description : 'Medical Services');
    const doctorName = currentBill.doctorName || (currentBill.appointment && currentBill.appointment.doctor ? currentBill.appointment.doctor.fullName : 'N/A');
    const amount = currentBill.balanceAmount || currentBill.amount;

    const billDetailsHtml = `
        <div style="background: var(--gray-50); padding: 1.25rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--gray-600);">Bill ID:</span>
                <strong>#${currentBill.billNumber || currentBill.id}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--gray-600);">Description:</span>
                <strong>${description}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--gray-600);">Doctor:</span>
                <strong>${doctorName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 0.75rem; border-top: 2px solid var(--gray-200);">
                <span style="font-size: 1.125rem; font-weight: 600;">Amount to Pay:</span>
                <strong style="font-size: 1.5rem; color: var(--primary-color);">₹${amount}</strong>
            </div>
        </div>
    `;

    document.getElementById('billDetails').innerHTML = billDetailsHtml;
    document.getElementById('paymentModal').classList.add('show');
}

// View Bill Details
function viewBillDetails(billId) {
    const bill = allBills.find(b => b.id === billId);
    if (!bill) return;

    const description = bill.description || (bill.items && bill.items.length > 0 ? bill.items[0].description : 'Medical Services');
    const doctorName = bill.doctorName || (bill.appointment && bill.appointment.doctor ? bill.appointment.doctor.fullName : 'N/A');
    const date = bill.billDate || bill.generatedAt;
    const amount = bill.amount;
    const paidAmount = bill.paidAmount || 0;
    const balanceAmount = bill.balanceAmount || 0;
    const status = bill.status || 'PENDING';

    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); color: white; border-radius: 0.75rem;">
                <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem;">₹${amount}</h2>
                <p style="margin: 0; opacity: 0.9;">Total Bill Amount</p>
                ${balanceAmount > 0 ? `<p style="margin: 0.5rem 0 0 0; font-weight: 600;">Balance Due: ₹${balanceAmount}</p>` : ''}
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div>
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Bill ID</strong>
                    <p style="margin: 0.25rem 0 0 0;">#${bill.billNumber || bill.id}</p>
                </div>
                <div>
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Date</strong>
                    <p style="margin: 0.25rem 0 0 0;">${date ? new Date(date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Doctor</strong>
                    <p style="margin: 0.25rem 0 0 0;">${doctorName}</p>
                </div>
                <div>
                    <strong style="color: var(--gray-600); font-size: 0.875rem;">Status</strong>
                    <p style="margin: 0.25rem 0 0 0;">
                        <span class="status-badge ${status.toLowerCase()}">${status}</span>
                    </p>
                </div>
            </div>
            
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Description</strong>
                <p style="margin: 0; padding: 1rem; background: var(--gray-50); border-radius: 0.5rem;">${description}</p>
            </div>
            
            ${status === 'PAID' || status === 'PARTIAL' ? `
            <div style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <strong style="color: var(--gray-600); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Payment Information</strong>
                <div style="background: var(--bg-success); padding: 1rem; border-radius: 0.5rem;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Paid Amount:</strong> ₹${paidAmount}</p>
                    ${bill.paymentMethod ? `<p style="margin: 0 0 0.5rem 0;"><strong>Payment Method:</strong> ${bill.paymentMethod}</p>` : ''}
                    ${bill.paidAt ? `<p style="margin: 0;"><strong>Last Payment Date:</strong> ${new Date(bill.paidAt).toLocaleDateString()}</p>` : ''}
                </div>
            </div>
            ` : ''}

            ${status !== 'PAID' ? `
            <div style="text-align: center; padding: 1rem;">
                <button class="btn-primary" onclick="closeModal('billDetailsModal'); showPaymentModal(${bill.id});">
                    <i class="fas fa-credit-card"></i> Pay Now
                </button>
            </div>
            ` : ''}
        </div>
    `;

    document.getElementById('billDetailsContent').innerHTML = content;
    document.getElementById('billDetailsModal').classList.add('show');
}

// Process Payment
async function processPayment() {
    if (!currentBill) return;

    const paymentMethod = document.getElementById('paymentMethod').value;
    const amount = currentBill.balanceAmount || currentBill.amount;
    const notes = `Payment via Patient Portal (${paymentMethod})`;

    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/bills/${currentBill.id}/pay`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentMethod,
                amount,
                notes
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Payment failed');
        }

        const updatedBill = await response.json();
        processPaymentSuccess(updatedBill);

    } catch (error) {
        console.error('Payment error:', error);
        showToast(error.message, 'error');
        // For demo purposes, if API fails, show success anyway (optional)
        // processPaymentSuccess();
    }
}

// Process Payment Success
function processPaymentSuccess() {
    // Update bill status
    currentBill.status = 'PAID';
    currentBill.paymentDate = new Date().toISOString();
    currentBill.paymentMethod = document.getElementById('paymentMethod').value.toUpperCase();

    // Save to localStorage for persistence
    localStorage.setItem('bills', JSON.stringify(allBills));

    // Close modal
    closeModal('paymentModal');

    // Show success
    showToast('Payment successful! ₹' + currentBill.amount + ' paid', 'success');

    // Reload bills
    displayBills(allBills);
    updateSummary();

    // Create notification
    if (window.addNotification) {
        addNotification('revenue', 'Payment Successful', `₹${currentBill.amount} paid for ${currentBill.description}`);
    }

    currentBill = null;
}

// Setup Event Listeners
function setupEventListeners() {
    // Payment method change
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-details').forEach(el => el.style.display = 'none');
            if (e.target.value === 'card') {
                document.getElementById('cardDetails').style.display = 'block';
            } else if (e.target.value === 'upi') {
                document.getElementById('upiDetails').style.display = 'block';
            }
        });
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            const filtered = status ? allBills.filter(b => b.status === status) : allBills;
            displayBills(filtered);
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadBills();
            showToast('Bills refreshed', 'success');
        });
    }

    // Card number formatting
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Expiry date formatting
    const cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    // Modal close on outside click
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    };
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
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
    window.location.href = 'index.html';
}

// Export functions
window.showPaymentModal = showPaymentModal;
window.viewBillDetails = viewBillDetails;
window.processPayment = processPayment;
window.closeModal = closeModal;
window.logout = logout;
