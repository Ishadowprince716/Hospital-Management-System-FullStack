// Registration Logic

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');

    // Check if auth.js is loaded
    if (!window.hospitalAuth) {
        console.error('Auth module not loaded');
        return;
    }

    const { API_BASE_URL, showToast, MOCK_MODE } = window.hospitalAuth;

    // Handle Role Selection
    const roleBtns = document.querySelectorAll('.role-btn');
    const roleInput = document.getElementById('role');

    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            roleBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update hidden input value
            roleInput.value = btn.dataset.role;
        });
    });

    // OTP State Removed

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = roleInput.value;

        if (!fullName || !username || !email || !password) {
            showToast('Please fill in required fields', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'warning');
            return;
        }

        setLoading(true);

        try {
            if (MOCK_MODE) {
                // Mock registration
                await new Promise(resolve => setTimeout(resolve, 800));
                showToast('Registration successful! Please login.', 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                // Real API registration
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName,
                        username,
                        email,
                        phoneNumber,
                        password,
                        role
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }

                showToast(data.message || 'Registration successful! Please login.', 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        const btnText = registerBtn.querySelector('.btn-text');
        const btnLoader = registerBtn.querySelector('.btn-loader');

        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            registerBtn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            registerBtn.disabled = false;
        }
    }
});
