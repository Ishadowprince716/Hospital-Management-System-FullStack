package com.hospital.repository.mysql;

import com.hospital.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorIdAndIsAvailable(Long doctorId, Boolean isAvailable);

    List<DoctorAvailability> findByDoctorIdAndDayOfWeek(Long doctorId, String dayOfWeek);

    List<DoctorAvailability> findByDoctorId(Long doctorId);
}
