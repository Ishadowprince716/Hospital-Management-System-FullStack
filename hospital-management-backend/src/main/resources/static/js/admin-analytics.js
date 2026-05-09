// API Base URL
const API_BASE = 'http://localhost:8080/api';

// global chart instances to destroy before re-rendering
let revenueChartInstance = null;
let statusChartInstance = null;
let deptRevenueChartInstance = null;
let growthChartInstance = null;

async function loadAnalyticsData() {
    console.log('Loading analytics data...');
    try {
        const response = await fetch(`${API_BASE}/admin/analytics/dashboard`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch analytics data');

        const data = await response.json();
        renderAnalyticsDashboard(data);
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Show error toast?
    }
}

function renderAnalyticsDashboard(data) {
    // 1. Render Summary Cards
    const statsContainer = document.getElementById('analytics-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                <div class="stat-info">
                    <h3>Total Revenue</h3>
                    <p class="stat-value">$${(data.totalRevenue || 0).toLocaleString()}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="stat-info">
                    <h3>Total Appointments</h3>
                    <p class="stat-value">${data.totalAppointments || 0}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user-injured"></i></div>
                <div class="stat-info">
                    <h3>Total Patients</h3>
                    <p class="stat-value">${data.totalPatients || 0}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user-md"></i></div>
                <div class="stat-info">
                    <h3>Total Doctors</h3>
                    <p class="stat-value">${data.totalDoctors || 0}</p>
                </div>
            </div>
        `;
    }

    // 2. Check if we have any chart data
    const hasRevenue = data.revenueByMonth && Object.keys(data.revenueByMonth).length > 0;
    const hasAppointments = data.appointmentsByMonth && Object.keys(data.appointmentsByMonth).length > 0;
    const hasStatus = data.appointmentsByStatus && Object.keys(data.appointmentsByStatus).length > 0;
    const hasDeptRevenue = data.revenueByDepartment && Object.keys(data.revenueByDepartment).length > 0;

    // Render charts with data or show placeholder
    renderRevenueChart(hasRevenue ? data.revenueByMonth : null);
    renderStatusChart(hasStatus ? data.appointmentsByStatus : null);
    renderDeptRevenueChart(hasDeptRevenue ? data.revenueByDepartment : null);
    renderGrowthChart(hasAppointments ? data.appointmentsByMonth : null);
}

function renderRevenueChart(dataMap) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (revenueChartInstance) revenueChartInstance.destroy();

    if (!dataMap || Object.keys(dataMap).length === 0) {
        ctx.parentElement.innerHTML = '<div style="height:300px; display:flex; align-items:center; justify-content:center; color:var(--gray-500);"><i class="fas fa-chart-line" style="font-size:3rem; margin-bottom:1rem;"></i><span>No revenue data available yet.<br><small>Data will appear once bills are paid.</small></span></div>';
        return;
    }

    const labels = Object.keys(dataMap).reverse();
    const values = Object.values(dataMap).reverse();

    // No Revenue Chart in this view anymore, but keeping function for safety or if re-added
    // ...
}

function renderStatusChart(dataMap) {
    const ctx = document.getElementById('appointmentStatusChart');
    if (!ctx) return;
    if (statusChartInstance) statusChartInstance.destroy();

    if (!dataMap || Object.keys(dataMap).length === 0) {
        ctx.parentElement.innerHTML = `<div style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--gray-500);">
            <i class="fas fa-chart-pie" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
            <div style="font-weight:500; margin-bottom:0.5rem;">No status data available</div>
            <small style="opacity:0.7;">Data will appear after appointments</small>
        </div>`;
        return;
    }

    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(dataMap),
            datasets: [{
                data: Object.values(dataMap),
                backgroundColor: ['#2dd4bf', '#fb923c', '#4ade80', '#94a3b8'], // Teal, Orange, Green, Gray
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderDeptRevenueChart(dataMap) {
    const ctx = document.getElementById('departmentRevenueChart');
    if (!ctx) return;
    if (deptRevenueChartInstance) deptRevenueChartInstance.destroy();

    if (!dataMap || Object.keys(dataMap).length === 0) {
        ctx.parentElement.innerHTML = `<div style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--gray-500);">
            <i class="fas fa-chart-bar" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
            <div style="font-weight:500; margin-bottom:0.5rem;">No department revenue</div>
            <small style="opacity:0.7;">Data will appear after billing</small>
        </div>`;
        return;
    }

    deptRevenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataMap),
            datasets: [{
                label: 'Revenue ($)',
                data: Object.values(dataMap),
                backgroundColor: ['#2dd4bf', '#5eead4', '#0d9488', '#99f6e4'], // Teal Shades
                borderRadius: 4,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal Layout
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false } }
            }
        }
    });
}

function renderGrowthChart(dataMap) {
    const ctx = document.getElementById('appointmentGrowthChart');
    if (!ctx) return;
    if (growthChartInstance) growthChartInstance.destroy();

    if (!dataMap || Object.keys(dataMap).length === 0) {
        ctx.parentElement.innerHTML = `<div style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--gray-500);">
            <i class="fas fa-chart-area" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
            <div style="font-weight:500; margin-bottom:0.5rem;">No growth data available</div>
            <small style="opacity:0.7;">Data will appear over time</small>
        </div>`;
        return;
    }

    const labels = Object.keys(dataMap).reverse();
    const values = Object.values(dataMap).reverse();

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Appointments',
                data: values,
                borderColor: '#2dd4bf', // Teal
                backgroundColor: 'rgba(45, 212, 191, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2dd4bf',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                x: { grid: { display: false } }
            }
        }
    });
}
