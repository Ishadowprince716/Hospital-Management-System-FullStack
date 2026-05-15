package com.hospital.repository.mysql;

import com.hospital.model.CarePlanTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarePlanTaskRepository extends JpaRepository<CarePlanTask, Long> {
    List<CarePlanTask> findByPatient_IdOrderByDoneAscCreatedAtAsc(Long patientId);
}
