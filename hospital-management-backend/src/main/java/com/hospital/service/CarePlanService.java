package com.hospital.service;

import com.hospital.dto.CarePlanTaskDTO;
import com.hospital.model.CarePlanTask;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.CarePlanTaskRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CarePlanService {

    private final CarePlanTaskRepository carePlanTaskRepository;
    private final PatientRepository patientRepository;

    public CarePlanService(CarePlanTaskRepository carePlanTaskRepository, PatientRepository patientRepository) {
        this.carePlanTaskRepository = carePlanTaskRepository;
        this.patientRepository = patientRepository;
    }

    public List<CarePlanTaskDTO> getPatientTasks(Long patientId) {
        return carePlanTaskRepository.findByPatient_IdOrderByDoneAscCreatedAtAsc(patientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CarePlanTaskDTO createTask(Long patientId, CarePlanTaskDTO request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        CarePlanTask task = new CarePlanTask();
        task.setPatient(patient);
        task.setTitle(clean(request.getTitle(), "Care task"));
        task.setCategory(clean(request.getCategory(), "Monitoring"));
        task.setTime(clean(request.getTime(), "Anytime"));
        task.setDone(request.isDone());
        return toDto(carePlanTaskRepository.save(task));
    }

    @Transactional
    public CarePlanTaskDTO toggleTask(Long taskId) {
        CarePlanTask task = carePlanTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Care plan task not found"));
        task.setDone(!task.isDone());
        return toDto(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        if (!carePlanTaskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("Care plan task not found");
        }
        carePlanTaskRepository.deleteById(taskId);
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }
        return value.trim();
    }

    private CarePlanTaskDTO toDto(CarePlanTask task) {
        return new CarePlanTaskDTO(
                task.getId(),
                task.getTitle(),
                task.getCategory(),
                task.getTime(),
                task.isDone()
        );
    }
}
