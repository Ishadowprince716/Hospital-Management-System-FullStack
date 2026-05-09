/**
 * Payment Gateway Simulation
 * Integates with backend PaymentController to simulate Stripe transactions.
 */

let currentBillId = null;

function openPaymentModal(billId, amount) {
    currentBillId = billId;
    document.getElementById('paymentBillId').textContent = `#${billId}`;
    document.getElementById('paymentAmount').textContent = `$${amount.toFixed(2)}`;

    // Clear form
    document.getElementById('paymentForm').reset();

    document.getElementById('paymentModal').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
});

async function handlePaymentSubmit(e) {
    e.preventDefault();

    if (!currentBillId) return;

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    try {
        // 1. UI Loading State
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

        // 2. Validate Inputs (Simple check)
        const name = document.getElementById('cardName').value;
        const number = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('cardExpiry').value;
        const cvc = document.getElementById('cardCvc').value;

        if (number.length < 16 || expiry.length < 5 || cvc.length < 3) {
            throw new Error("Invalid card details");
        }

        // 3. Call Backend Payment Simulation
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/payments/process`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                billId: currentBillId,
                amount: parseFloat(document.getElementById('paymentAmount').textContent.replace('$', '')),
                paymentMethod: 'card'
            })
        });

        if (!response.ok) {
            const apiResponse = await response.json();
            const err = apiResponse.data || apiResponse;
            throw new Error(err.message || err.error || 'Payment failed');
        }

        const apiResponse = await response.json();
        const data = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse);

        // 4. Success Handling
        closeModal('paymentModal');
        showToast('Payment Successful!', 'success');

        // Refresh Bills List if the function exists in patient-dashboard.js
        if (typeof loadBilling === 'function') {
            loadBilling();
        }

    } catch (error) {
        console.error('Payment Error:', error);
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Helper for card formatting (optional polish)
document.getElementById('cardNumber')?.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
});

document.getElementById('cardExpiry')?.addEventListener('input', function (e) {
    if (e.target.value.length === 2 && !e.target.value.includes('/')) {
        e.target.value = e.target.value + '/';
    }
});
