package com.hospital.service;

import com.hospital.model.MedicalDocument;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.repository.mysql.MedicalDocumentRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class MedicalDocumentService {

    private final MedicalDocumentRepository documentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    private final String uploadDir = "uploads/medical-documents/";

    public MedicalDocumentService(MedicalDocumentRepository documentRepository,
                                PatientRepository patientRepository,
                                UserRepository userRepository,
                                S3Service s3Service) {
        this.documentRepository = documentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;

        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Transactional
    public MedicalDocument uploadDocument(MultipartFile file, Long patientId, String documentType, String description, Long uploadedBy) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && !contentType.startsWith("image/"))) {
            throw new IllegalArgumentException("Only PDF and image files are allowed");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        User uploader = null;
        if (uploadedBy != null) {
            uploader = userRepository.findById(uploadedBy).orElse(null);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".pdf";
        String filename = UUID.randomUUID().toString() + extension;

        String fileUrl;
        boolean isS3 = false;

        if (s3Service.isEnabled()) {
            fileUrl = s3Service.uploadFile(file, "medical-documents/" + filename);
            isS3 = true;
        } else {
            Path path = Paths.get(uploadDir + filename);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            fileUrl = "/api/medical-documents/view/" + filename;
        }

        MedicalDocument document = new MedicalDocument();
        document.setPatient(patient);
        document.setFileName(originalFilename);
        document.setFileType(contentType);
        document.setDocumentType(documentType);
        document.setDescription(description);
        document.setFileUrl(fileUrl);
        document.setIsS3(isS3);
        document.setUploadedBy(uploader);

        return documentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public Page<MedicalDocument> getPatientDocuments(Long patientId, Pageable pageable) {
        return documentRepository.findByPatientId(patientId, pageable);
    }

    @Transactional
    public void deleteDocument(Long id) {
        MedicalDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + id));

        if (document.getIsS3() && s3Service.isEnabled()) {
            String key = document.getFileUrl().substring(document.getFileUrl().lastIndexOf("/") + 1);
            s3Service.deleteFile("medical-documents/" + key);
        } else {
            String filename = document.getFileUrl().substring(document.getFileUrl().lastIndexOf("/") + 1);
            try {
                Files.deleteIfExists(Paths.get(uploadDir + filename));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        documentRepository.delete(document);
    }

    public Path getLocalFilePath(String filename) {
        return Paths.get(uploadDir + filename);
    }
}
