/**
 * Quick Test Data Generator for Analytics Demo
 * This adds sample appointments and bills directly via the backend API
 */

// Configuration
const API_BASE = 'http://localhost:8080/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

/**
 * Main function to populate test data
 */
async function populateTestData() {
    console.log('🚀 Starting test data population...');

    try {
        // Step 1: Login as admin
        console.log('📝 Logging in as admin...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ADMIN_CREDENTIALS)
        });

        if (!loginResponse.ok) {
            throw new Error('Login failed');
        }

        const { token } = await loginResponse.json();
        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('✅ Login successful');

        // Step 2: Get existing doctors and patients
        console.log('\n📋 Fetching doctors and patients...');
        const doctors = await fetch(`${API_BASE}/doctors/list`, { headers: authHeaders }).then(r => r.json());
        const patients = await fetch(`${API_BASE}/patients/list`, { headers: authHeaders }).then(r => r.json());

        console.log(`Found ${doctors.length} doctors and ${patients.length} patients`);

        if (doctors.length === 0 || patients.length === 0) {
            console.error('❌ Need at least 1 doctor and 1 patient');
            return;
        }

        // Step 3: Create appointments
        console.log('\n📅 Creating test appointments...');
        const createdAppointments = [];

        for (let i = 0; i < 8; i++) {
            const doctor = doctors[i % doctors.length];
            const patient = patients[i % patients.length];

            // Create appointments spread over last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const appointmentData = {
                patientId: patient.id,
                doctorId: doctor.id,
                appointmentDate: date.toISOString().split('T')[0],
                appointmentTime: `${9 + (i % 8)}:00`,
                reason: `Test appointment ${i + 1} - Routine checkup`,
                status: daysAgo > 5 ? 'COMPLETED' : 'SCHEDULED'
            };

            try {
                const apt = await fetch(`${API_BASE}/appointments/book`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify(appointmentData)
                }).then(r => r.json());

                createdAppointments.push(apt);
                console.log(`  ✓ Appointment ${i + 1}: ${patient.fullName} → Dr. ${doctor.fullName}`);
            } catch (error) {
                console.log(`  ✗ Failed to create appointment ${i + 1}`);
            }
        }

        // Step 4: Create and pay bills
        console.log('\n💵 Creating and paying bills...');
        let billsCreated = 0;
        let billsPaid = 0;

        // Get all appointments to create bills for completed ones
        const allAppointments = await fetch(`${API_BASE}/appointments/all`, { headers: authHeaders }).then(r => r.json());

        for (const apt of allAppointments) {
            if (apt.status === 'COMPLETED') {
                const amount = 100 + Math.floor(Math.random() * 400); // $100-$500

                try {
                    const bill = await fetch(`${API_BASE}/bills/create`, {
                        method: 'POST',
                        headers: authHeaders,
                        body: JSON.stringify({
                            appointmentId: apt.id,
                            patientId: apt.patient.id,
                            amount: amount,
                            description: `Consultation fee for appointment #${apt.id}`,
                            status: 'PENDING'
                        })
                    }).then(r => r.json());

                    billsCreated++;

                    // Pay 60% of bills randomly
                    if (Math.random() > 0.4) {
                        await fetch(`${API_BASE}/bills/${bill.id}/pay`, {
                            method: 'PUT',
                            headers: authHeaders
                        });
                        billsPaid++;
                        console.log(`  ✓ Bill #${bill.id}: $${amount} (PAID)`);
                    } else {
                        console.log(`  ✓ Bill #${bill.id}: $${amount} (PENDING)`);
                    }
                } catch (error) {
                    console.log(`  ✗ Failed to create bill for appointment ${apt.id}`);
                }
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('✅ TEST DATA POPULATION COMPLETE!');
        console.log('='.repeat(50));
        console.log(`📊 Summary:`);
        console.log(`   • Appointments created: ${createdAppointments.length}`);
        console.log(`   • Bills created: ${billsCreated}`);
        console.log(`   • Bills paid: ${billsPaid}`);
        console.log('\n🎯 Next Steps:');
        console.log('   1. Refresh the Admin Dashboard');
        console.log('   2. Click "Analytics" to see populated charts!');
        console.log('   3. View colorful graphs with your test data\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   • Make sure backend is running on port 8080');
        console.log('   • Verify admin credentials are correct');
        console.log('   • Check browser console for errors');
    }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('📢 Test Data Generator Loaded!');
    console.log('Run: populateTestData()');
    window.populateTestData = populateTestData;
}

// Export for Node.js
if (typeof module !== 'undefined') {
    module.exports = { populateTestData };
}
