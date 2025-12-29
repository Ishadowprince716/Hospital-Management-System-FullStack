package com.hospital.service;

import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.BillRepository;
import com.hospital.repository.mysql.DoctorRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;

    public AdminService(PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            BillRepository billRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Entity Counts
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());

        // Revenue Calculation (Sum of PAID bills)
        // Ideally handled by a custom query in Repository "SELECT SUM(b.amount) FROM
        // Bill b WHERE b.status = 'PAID'"
        // For now, doing simple stream for logic clarity (safe for small scale)
        double totalRevenue = billRepository.findByStatus("PAID").stream()
                .mapToDouble(bill -> bill.getAmount() != null ? bill.getAmount() : 0.0)
                .sum();

        stats.put("totalRevenue", totalRevenue);

        return stats;
    }
}
