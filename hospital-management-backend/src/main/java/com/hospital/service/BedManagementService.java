package com.hospital.service;

import com.hospital.model.AdmissionLog;
import com.hospital.model.Bed;
import com.hospital.model.Patient;
import com.hospital.model.Ward;
import com.hospital.repository.mysql.AdmissionLogRepository;
import com.hospital.repository.mysql.BedRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BedManagementService {

    private final WardRepository wardRepository;
    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final AdmissionLogRepository admissionLogRepository;
    private final NotificationService notificationService;

    public BedManagementService(WardRepository wardRepository,
                               BedRepository bedRepository,
                               PatientRepository patientRepository,
                               AdmissionLogRepository admissionLogRepository,
                               NotificationService notificationService) {
        this.wardRepository = wardRepository;
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
        this.admissionLogRepository = admissionLogRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Bed assignBed(Long bedId, Long patientId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new RuntimeException("Bed not found"));
        
        if (bed.getStatus() != Bed.BedStatus.AVAILABLE) {
            throw new RuntimeException("Bed is not available");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        bed.setStatus(Bed.BedStatus.OCCUPIED);
        bed.setCurrentPatient(patient);
        Bed savedBed = bedRepository.save(bed);

        AdmissionLog log = AdmissionLog.builder()
                .patient(patient)
                .bed(savedBed)
                .admissionDate(LocalDateTime.now())
                .build();
        admissionLogRepository.save(log);

        return savedBed;
    }

    @Transactional
    public void releaseBed(Long bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new RuntimeException("Bed not found"));

        List<AdmissionLog> activeLogs = admissionLogRepository.findByBedIdAndDischargeDateIsNull(bedId);
        for (AdmissionLog log : activeLogs) {
            log.setDischargeDate(LocalDateTime.now());
            admissionLogRepository.save(log);
        }

        bed.setStatus(Bed.BedStatus.CLEANING);
        bed.setCurrentPatient(null);
        bedRepository.save(bed);
        
        notificationService.sendGlobalNotification("BED_STATUS_UPDATE", "Bed " + bed.getBedNumber() + " is now being cleaned.", "INFO");
    }

    public List<Ward> getAllWards() {
        return wardRepository.findAll();
    }
    
    public double getOccupancyRate(Long wardId) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        
        long occupied = ward.getBeds().stream()
                .filter(b -> b.getStatus() == Bed.BedStatus.OCCUPIED)
                .count();
        
        return (double) occupied / ward.getTotalCapacity();
    }
}
