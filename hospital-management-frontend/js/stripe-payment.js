/**
 * Real Stripe Payment Integration
 * Uses Stripe.js and Payment Intents for secure payment processing
 */

const API_BASE = 'http://localhost:8080/api';

// Get Stripe publishable key from backend
let stripePublishableKey = null;
let stripe = null;

// Initialize Stripe
async function initializeStripe() {
    try {
        // Fetch publishable key from backend
        const response = await fetch(`${API_BASE}/config/stripe-key`);
        const apiResponse = await response.json();
        const data = apiResponse.data || apiResponse;
        stripePublishableKey = data.publishableKey;

        // Initialize Stripe.js
        stripe = Stripe(stripePublishableKey);
        console.log('✓ Stripe initialized');
    } catch (error) {
        console.error('✗ Failed to initialize Stripe:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeStripe);

/**
 * Open real Stripe payment modal
 */
async function openStripePaymentModal(billId, amount, description) {
    if (!stripe) {
        showToast('Payment system not initialized. Please refresh the page.', 'error');
        return;
    }

    // Show loading
    showLoadingIndicator('payment-modal-content', 'Initializing payment...');

    try {
        // Create Payment Intent on backend
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                billId: billId,
                amount: amount,
                description: description
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }

        const apiResponse = await response.json();
        const { clientSecret } = apiResponse.data || apiResponse;

        // Create Stripe Elements
        const elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create('payment');

        // Mount payment element
        document.getElementById('payment-modal-content').innerHTML = `
            <div class="stripe-payment-container">
                <h3>Pay $${amount.toFixed(2)}</h3>
                <p style="color: var(--gray-600); margin-bottom: 1.5rem;">${description}</p>
                <div id="payment-element"></div>
                <button id="submit-payment" class="btn-primary" style="margin-top: 1.5rem; width: 100%;">
                    <i class="fas fa-lock"></i> Pay Now
                </button>
                <p style="margin-top: 1rem; text-align: center; color: var(--gray-500); font-size: 0.875rem;">
                    <i class="fas fa-shield-alt"></i> Secured by Stripe
                </p>
            </div>
        `;

        paymentElement.mount('#payment-element');

        // Handle payment submission
        document.getElementById('submit-payment').addEventListener('click', async () => {
            const submitButton = document.getElementById('submit-payment');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success.html`,
                },
                redirect: 'if_required'
            });

            if (error) {
                showToast(error.message, 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
            } else {
                // Payment succeeded
                await confirmPaymentOnBackend(billId);
                showSuccessAnimation(() => {
                    closeModal('payment-modal');
                    location.reload();
                });
            }
        });

    } catch (error) {
        console.error('Payment error:', error);
        showToast('Failed to initialize payment. Please try again.', 'error');
    }
}

/**
 * Confirm payment on backend after Stripe confirms
 */
async function confirmPaymentOnBackend(billId) {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/payments/confirm/${billId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('✓ Payment confirmed on backend');
        }
    } catch (error) {
        console.error('Failed to confirm payment:', error);
    }
}

/**
 * Handle refund request
 */
async function requestRefund(billId) {
    if (!confirm('Are you sure you want to request a refund?')) {
        return;
    }

    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/payments/refund/${billId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const apiResponse = await response.json();
            const data = apiResponse.data || apiResponse;
            showToast('Refund processed successfully!', 'success');
            setTimeout(() => location.reload(), 2000);
        } else {
            throw new Error('Refund failed');
        }
    } catch (error) {
        console.error('Refund error:', error);
        showToast('Failed to process refund. Please contact support.', 'error');
    }
}

// Export functions
window.openStripePaymentModal = openStripePaymentModal;
window.requestRefund = requestRefund;
