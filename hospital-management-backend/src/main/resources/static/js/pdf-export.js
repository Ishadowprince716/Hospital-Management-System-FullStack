/**
 * Phase 12: Advanced PDF Export using jsPDF
 * Generates professional PDF reports for appointments, bills, and analytics
 */

// Note: This requires jsPDF library. Add to HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

/**
 * Export appointments to PDF
 */
async function exportAppointmentsToPDF(appointments) {
    if (typeof jsPDF === 'undefined') {
        showToast('PDF library not loaded. Please refresh the page.', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // Primary color
    doc.text('Hospital Management System', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Appointments Report', 105, 30, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 38, { align: 'center' });

    // Table headers
    let yPosition = 50;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');

    const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Status'];
    const xPositions = [10, 25, 70, 115, 145, 170];

    headers.forEach((header, i) => {
        doc.text(header, xPositions[i], yPosition);
    });

    // Draw line under headers
    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPosition + 2, 200, yPosition + 2);

    // Table data
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    yPosition += 8;

    appointments.slice(0, 30).forEach((apt, index) => { // Limit to 30 for single page
        if (yPosition > 270) { // New page if needed
            doc.addPage();
            yPosition = 20;
        }

        const rowData = [
            `#${apt.id}`,
            apt.patient?.fullName || 'N/A',
            apt.doctor?.fullName || 'N/A',
            new Date(apt.appointmentDate).toLocaleDateString(),
            apt.appointmentTime || '',
            apt.status || ''
        ];

        // Alternate row colors
        if (index % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(10, yPosition - 4, 190, 7, 'F');
        }

        rowData.forEach((data, i) => {
            doc.text(String(data).substring(0, 20), xPositions[i], yPosition);
        });

        yPosition += 7;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            105,
            290,
            { align: 'center' }
        );
    }

    // Save
    doc.save(`appointments_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF downloaded successfully!', 'success');
}

/**
 * Export analytics report to PDF with charts
 */
async function exportAnalyticsPDF(analyticsData) {
    if (typeof jsPDF === 'undefined') {
        showToast('PDF library not loaded', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(99, 102, 241);
    doc.text('Analytics Report', 105, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

    // Summary Stats
    let y = 60;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 20, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    const stats = [
        { label: 'Total Patients', value: analyticsData.totalPatients },
        { label: 'Total Doctors', value: analyticsData.totalDoctors },
        { label: 'Total Appointments', value: analyticsData.totalAppointments },
        { label: 'Total Revenue', value: `$${analyticsData.totalRevenue.toLocaleString()}` }
    ];

    stats.forEach(stat => {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, y - 5, 170, 10, 'F');
        doc.text(stat.label, 25, y);
        doc.setFont(undefined, 'bold');
        doc.text(String(stat.value), 150, y);
        doc.setFont(undefined, 'normal');
        y += 12;
    });

    // Charts section (capture canvas as image)
    y += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Visual Analytics', 20, y);

    // Note: To include actual charts, you'd need to convert canvas to image
    // Example: const chartImg = document.getElementById('revenueChart').toDataURL();
    // doc.addImage(chartImg, 'PNG', 20, y + 10, 170, 80);

    doc.save(`analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Analytics PDF downloaded!', 'success');
}

/**
 * Export bills to PDF with totals
 */
async function exportBillsPDF(bills) {
    if (typeof jsPDF === 'undefined') {
        showToast('PDF library not loaded', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('Billing Statement', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

    // Table
    let y = 45;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');

    const headers = ['Bill ID', 'Description', 'Amount', 'Status', 'Date'];
    const xPos = [15, 40, 120, 150, 175];

    headers.forEach((h, i) => doc.text(h, xPos[i], y));
    doc.line(15, y + 2, 195, y + 2);

    y += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    let totalAmount = 0;
    let paidAmount = 0;

    bills.forEach((bill, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        if (index % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(15, y - 4, 180, 7, 'F');
        }

        const data = [
            `#${bill.id}`,
            String(bill.description || 'Medical Services').substring(0, 30),
            `$${bill.amount.toLocaleString()}`,
            bill.status,
            new Date(bill.createdAt).toLocaleDateString()
        ];

        data.forEach((d, i) => doc.text(d, xPos[i], y));

        totalAmount += bill.amount;
        if (bill.status === 'PAID') paidAmount += bill.amount;

        y += 7;
    });

    // Totals
    y += 10;
    doc.setDrawColor(0, 0, 0);
    doc.line(120, y - 5, 195, y - 5);

    doc.setFont(undefined, 'bold');
    doc.text('Total Amount:', 120, y);
    doc.text(`$${totalAmount.toLocaleString()}`, 175, y);

    y += 7;
    doc.setTextColor(16, 185, 129);
    doc.text('Amount Paid:', 120, y);
    doc.text(`$${paidAmount.toLocaleString()}`, 175, y);

    y += 7;
    doc.setTextColor(239, 68, 68);
    doc.text('Outstanding:', 120, y);
    doc.text(`$${(totalAmount - paidAmount).toLocaleString()}`, 175, y);

    doc.save(`bills_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Bills PDF downloaded!', 'success');
}

// Make functions globally available
window.exportAppointmentsToPDF = exportAppointmentsToPDF;
window.exportAnalyticsPDF = exportAnalyticsPDF;
window.exportBillsPDF = exportBillsPDF;
