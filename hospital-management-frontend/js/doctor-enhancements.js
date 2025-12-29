// Prescription Templates - Common Medications
const PRESCRIPTION_TEMPLATES = {
    'fever': {
        diagnosis: 'Viral Fever',
        medications: [
            { name: 'Paracetamol', dosage: '500mg', frequency: 'Three times daily', duration: '5 days', route: 'ORAL', instructions: 'Take after meals', quantity: 15 },
            { name: 'Vitamin C', dosage: '1000mg', frequency: 'Once daily', duration: '7 days', route: 'ORAL', instructions: 'Take with water', quantity: 7 }
        ]
    },
    'cold': {
        diagnosis: 'Common Cold',
        medications: [
            { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5 days', route: 'ORAL', instructions: 'Take at bedtime', quantity: 5 },
            { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '5 days', route: 'ORAL', instructions: 'For fever/pain', quantity: 10 }
        ]
    },
    'headache': {
        diagnosis: 'Migraine/Headache',
        medications: [
            { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '3 days', route: 'ORAL', instructions: 'Take with food', quantity: 6 }
        ]
    },
    'gastritis': {
        diagnosis: 'Gastritis',
        medications: [
            { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days', route: 'ORAL', instructions: 'Take before breakfast', quantity: 14 },
            { name: 'Antacid', dosage: '10ml', frequency: 'Three times daily', duration: '7 days', route: 'ORAL', instructions: 'After meals', quantity: 210 }
        ]
    },
    'allergy': {
        diagnosis: 'Allergic Reaction',
        medications: [
            { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '10 days', route: 'ORAL', instructions: 'Take at bedtime', quantity: 10 },
            { name: 'Prednisolone', dosage: '5mg', frequency: 'Twice daily', duration: '5 days', route: 'ORAL', instructions: 'Take with food', quantity: 10 }
        ]
    }
};

// Common Lab Tests Templates
const LAB_TEST_TEMPLATES = [
    { type: 'Blood Test', name: 'Complete Blood Count (CBC)', priority: 'ROUTINE' },
    { type: 'Blood Test', name: 'Blood Sugar (Fasting)', priority: 'ROUTINE' },
    { type: 'Blood Test', name: 'Lipid Profile', priority: 'ROUTINE' },
    { type: 'Blood Test', name: 'Liver Function Test (LFT)', priority: 'ROUTINE' },
    { type: 'Blood Test', name: 'Kidney Function Test (KFT)', priority: 'ROUTINE' },
    { type: 'Blood Test', name: 'Thyroid Profile', priority: 'ROUTINE' },
    { type: 'X-Ray', name: 'Chest X-Ray', priority: 'URGENT' },
    { type: 'X-Ray', name: 'Abdominal X-Ray', priority: 'ROUTINE' },
    { type: 'Ultrasound', name: 'Abdominal Ultrasound', priority: 'ROUTINE' },
    { type: 'ECG', name: 'Electrocardiogram', priority: 'URGENT' }
];

// Apply Prescription Template
function applyPrescriptionTemplate(templateKey) {
    const template = PRESCRIPTION_TEMPLATES[templateKey];
    if (!template) return;

    // Set diagnosis
    document.getElementById('prescriptionDiagnosis').value = template.diagnosis;

    // Clear existing medications
    document.getElementById('medicationsList').innerHTML = '';

    // Add medications from template
    template.medications.forEach(med => {
        addMedicationWithData(med);
    });

    showToast(`Applied ${template.diagnosis} template`, 'success');
}

// Add Medication with Pre-filled Data
function addMedicationWithData(medData) {
    const medicationsList = document.getElementById('medicationsList');
    const medIndex = medicationsList.children.length;

    const medItem = document.createElement('div');
    medItem.className = 'medication-item';
    medItem.innerHTML = `
        <input type="text" placeholder="Medication Name" value="${medData.name}" required>
        <input type="text" placeholder="Dosage" value="${medData.dosage}" required>
        <input type="text" placeholder="Frequency" value="${medData.frequency}" required>
        <input type="text" placeholder="Duration" value="${medData.duration}" required>
        <select required>
            <option value="">Route</option>
            <option value="ORAL" ${medData.route === 'ORAL' ? 'selected' : ''}>Oral</option>
            <option value="INJECTION" ${medData.route === 'INJECTION' ? 'selected' : ''}>Injection</option>
            <option value="TOPICAL" ${medData.route === 'TOPICAL' ? 'selected' : ''}>Topical</option>
            <option value="INHALATION" ${medData.route === 'INHALATION' ? 'selected' : ''}>Inhalation</option>
        </select>
        <input type="text" placeholder="Instructions" value="${medData.instructions}">
        <input type="number" placeholder="Qty" value="${medData.quantity}" min="1">
        <button type="button" class="btn-remove" onclick="removeMedication(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    medicationsList.appendChild(medItem);
}

// Remove Medication
function removeMedication(button) {
    button.closest('.medication-item').remove();
}

// Add Empty Medication
function addMedication() {
    addMedicationWithData({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        route: '',
        instructions: '',
        quantity: 1
    });
}

// Show Prescription Templates Modal
function showPrescriptionTemplates() {
    const templatesHTML = Object.keys(PRESCRIPTION_TEMPLATES).map(key => {
        const template = PRESCRIPTION_TEMPLATES[key];
        return `
            <div class="template-card" onclick="applyPrescriptionTemplate('${key}')">
                <h4>${template.diagnosis}</h4>
                <p>${template.medications.length} medication(s)</p>
            </div>
        `;
    }).join('');

    // Show in a modal or dropdown
    showToast('Select a template from the prescription form', 'info');
}

// Enhanced Vital Signs Chart
function showVitalSignsChart(patientId, vitalSignsData) {
    const chartContainer = document.createElement('div');
    chartContainer.innerHTML = `
        <canvas id="vitalSignsChart" width="400" height="200"></canvas>
    `;

    // Extract data for chart
    const dates = vitalSignsData.map(v => new Date(v.recordedAt).toLocaleDateString());
    const bpData = vitalSignsData.map(v => {
        const bp = v.bloodPressure?.split('/');
        return bp ? parseInt(bp[0]) : null;
    });
    const pulseData = vitalSignsData.map(v => v.pulse);
    const tempData = vitalSignsData.map(v => v.temperature);

    new Chart(document.getElementById('vitalSignsChart'), {
        type: 'line',
        data: {
            labels: dates.reverse(),
            datasets: [
                {
                    label: 'Systolic BP',
                    data: bpData.reverse(),
                    borderColor: '#ef4444',
                    tension: 0.4
                },
                {
                    label: 'Pulse',
                    data: pulseData.reverse(),
                    borderColor: '#2563eb',
                    tension: 0.4
                },
                {
                    label: 'Temperature',
                    data: tempData.reverse(),
                    borderColor: '#f59e0b',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'BP / Pulse' }
                },
                y1: {
                    position: 'right',
                    beginAtZero: false,
                    title: { display: true, text: 'Temperature (°C)' }
                }
            }
        }
    });
}

// Quick Lab Order
function quickLabOrder(testTemplate) {
    const test = LAB_TEST_TEMPLATES.find(t => t.name === testTemplate);
    if (!test) return;

    // Auto-fill lab order form
    showToast(`Creating ${test.name} order...`, 'info');
    // Implementation would open lab order modal with pre-filled data
}

// Export enhanced functions
window.prescriptionTemplates = PRESCRIPTION_TEMPLATES;
window.labTestTemplates = LAB_TEST_TEMPLATES;
window.applyPrescriptionTemplate = applyPrescriptionTemplate;
window.addMedication = addMedication;
window.removeMedication = removeMedication;
window.showVitalSignsChart = showVitalSignsChart;
window.quickLabOrder = quickLabOrder;
window.showPrescriptionTemplates = showPrescriptionTemplates;
