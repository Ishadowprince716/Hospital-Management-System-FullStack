package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.MedicalReport;
import com.hospital.service.FileStorageService;
import com.hospital.service.MedicalReportService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class MedicalReportController {

    private final MedicalReportService medicalReportService;
    private final FileStorageService fileStorageService;

    public MedicalReportController(MedicalReportService medicalReportService, FileStorageService fileStorageService) {
        this.medicalReportService = medicalReportService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalReport>> uploadReport(
            @RequestParam("patientId") Long patientId,
            @RequestParam("uploaderId") Long uploaderId,
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam("file") MultipartFile file) {
        MedicalReport report = medicalReportService.uploadReport(patientId, uploaderId, title, type, file);
        return ResponseEntity.status(201).body(ApiResponse.success(report, "Medical report uploaded successfully"));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<MedicalReport>>> getPatientReports(
            @PathVariable Long patientId,
            @PageableDefault(size = 10, sort = "uploadDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(medicalReportService.getPatientReports(patientId, pageable)));
    }

    @GetMapping("/{reportId}/download")
    public ResponseEntity<Resource> downloadReport(@PathVariable Long reportId) {
        MedicalReport report = medicalReportService.getReportById(reportId);
        Path filePath = fileStorageService.loadFileAsPath(report.getFileName());
        try {
            java.net.URI fileUri = filePath.toUri();
            Resource resource = new UrlResource(fileUri);

            if (resource.exists()) {
                String contentType = report.getFileType();
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + report.getReportTitle() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
