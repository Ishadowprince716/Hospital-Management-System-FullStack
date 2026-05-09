package com.hospital.service;

import com.hospital.dto.AnalyticsDashboardDTO;
import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.BillRepository;
import com.hospital.repository.mysql.DoctorRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class AnalyticsService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BillRepository billRepository;

    public AnalyticsDashboardDTO getAdminDashboardStats() {
        AnalyticsDashboardDTO stats = new AnalyticsDashboardDTO();

        // 1. Basic Counts
        stats.setTotalPatients(patientRepository.count());
        stats.setTotalDoctors(doctorRepository.count());
        stats.setTotalAppointments(appointmentRepository.count());

        // 2. Total Revenue
        List<Object[]> revenueData = billRepository.getMonthlyRevenue();
        double totalRevenue = 0;
        Map<String, Double> revenueByMonth = new LinkedHashMap<>();

        if (revenueData != null) {
            for (Object[] row : revenueData) {
                String month = (String) row[0];
                Double amount = (Double) row[1];
                totalRevenue += amount;
                revenueByMonth.put(month, amount);
            }
        }
        stats.setTotalRevenue(totalRevenue);
        stats.setRevenueByMonth(revenueByMonth);

        // 3. Appointments by Status
        Map<String, Long> apptByStatus = new HashMap<>();
        List<String> statuses = List.of("SCHEDULED", "COMPLETED", "CANCELLED");
        for (String status : statuses) {
            apptByStatus.put(status, (long) appointmentRepository.findByStatus(status).size());
        }
        stats.setAppointmentsByStatus(apptByStatus);

        // 4. Appointments by Month
        Map<String, Long> apptByMonth = new LinkedHashMap<>();
        List<Object[]> apptMonthData = appointmentRepository.getMonthlyAppointmentCount();
        if (apptMonthData != null) {
            for (Object[] row : apptMonthData) {
                apptByMonth.put((String) row[0], (Long) row[1]);
            }
        }
        stats.setAppointmentsByMonth(apptByMonth);

        // 5. Revenue by Department
        Map<String, Double> revByDept = new HashMap<>();
        List<Object[]> revDeptData = billRepository.getRevenueByDepartment();
        if (revDeptData != null) {
            for (Object[] row : revDeptData) {
                revByDept.put((String) row[0], (Double) row[1]);
            }
        }
        stats.setRevenueByDepartment(revByDept);

        // 6. Patient Age Distribution (Mock logic as complex SQL requires native query)
        // For production, this should be a DB query. We'll use a simplified version
        // here or skip if not critical.
        // We'll stick to what repositories provide easily for now.

        return stats;
    }
}
