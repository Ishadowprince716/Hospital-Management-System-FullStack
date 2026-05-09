package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.MedicalDocument;
import com.hospital.service.MedicalDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping({"/api/medical-documents", "/api/v1/medical-documents"})
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final MedicalDocumentService medicalDocumentService;

    public FileUploadController(MedicalDocumentService medicalDocumentService) {
        this.medicalDocumentService = medicalDocumentService;
    }

    /**
     * Upload medical document
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MedicalDocument>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "uploadedBy", required = false) Long uploadedBy) {

        try {
            MedicalDocument document = medicalDocumentService.uploadDocument(file, patientId, documentType, description, uploadedBy);
            return ResponseEntity.status(201).body(ApiResponse.success(document, "Document uploaded successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * Get documents for a patient with pagination
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<MedicalDocument>>> getPatientDocuments(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadDate").descending());
        Page<MedicalDocument> documents = medicalDocumentService.getPatientDocuments(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    /**
     * Delete document
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        medicalDocumentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Document deleted successfully"));
    }

    /**
     * Serve uploaded files from local storage (used when S3 is disabled)
     */
    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path path = medicalDocumentService.getLocalFilePath(filename);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                try {
                    contentType = java.nio.file.Files.probeContentType(path);
                } catch (IOException e) {
                    // Ignore
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
