package com.hospital.service;

import com.hospital.model.MedicalReport;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.repository.mysql.MedicalReportRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class MedicalReportService {

    private final MedicalReportRepository medicalReportRepository;
    private final FileStorageService fileStorageService;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public MedicalReportService(MedicalReportRepository medicalReportRepository,
            FileStorageService fileStorageService,
            PatientRepository patientRepository,
            UserRepository userRepository) {
        this.medicalReportRepository = medicalReportRepository;
        this.fileStorageService = fileStorageService;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MedicalReport uploadReport(Long patientId, Long uploaderId, String title, String type, MultipartFile file) {
        if (patientId == null) {
            throw new RuntimeException("Patient ID is required");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        if (uploaderId == null) {
            throw new RuntimeException("Uploader ID is required");
        }
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("Uploader user not found"));

        String fileName = fileStorageService.storeFile(file);

        MedicalReport report = new MedicalReport();
        report.setPatient(patient);
        report.setUploader(uploader);
        report.setReportTitle(title);
        report.setReportType(type);
        report.setFileName(fileName);
        report.setFileType(file.getContentType());

        return medicalReportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public Page<MedicalReport> getPatientReports(Long patientId, Pageable pageable) {
        return medicalReportRepository.findByPatientId(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public List<MedicalReport> getPatientReports(Long patientId) {
        return medicalReportRepository.findByPatientIdOrderByUploadDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public MedicalReport getReportById(Long reportId) {
        if (reportId == null) {
            throw new RuntimeException("Report ID is required");
        }
        return medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }
}
