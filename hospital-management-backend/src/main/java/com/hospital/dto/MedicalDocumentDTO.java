package com.hospital.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MedicalDocumentDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String documentType;
    private String description;
    private LocalDateTime uploadDate;
    private String uploadedByName;
}
