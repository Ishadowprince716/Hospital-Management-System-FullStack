package com.hospital.repository.mysql;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(Patient patient);

    List<Appointment> findByDoctor(Doctor doctor);

    List<Appointment> findByStatus(String status);

    List<Appointment> findByAppointmentDate(LocalDate date);

    List<Appointment> findByPatientAndStatus(Patient patient, String status);

    List<Appointment> findByDoctorAndStatus(Doctor doctor, String status);

    List<Appointment> findByDoctorAndAppointmentDate(Doctor doctor, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = ?1 AND a.appointmentDate = ?2 AND a.appointmentTime = ?3 AND a.status != 'CANCELLED'")
    List<Appointment> findConflictingAppointments(Doctor doctor, LocalDate date, LocalTime time);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN ?1 AND ?2")
    List<Appointment> findAppointmentsBetweenDates(LocalDate startDate, LocalDate endDate);

    long countByDoctorAndAppointmentDate(Doctor doctor, LocalDate date);
}
