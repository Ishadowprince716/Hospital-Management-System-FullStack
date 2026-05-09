package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.MedicalDocumentDTO;
import com.hospital.mapper.MedicalDocumentMapper;
import com.hospital.model.MedicalDocument;
import com.hospital.repository.mysql.MedicalDocumentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medical-documents")
@CrossOrigin(origins = "*")
public class MedicalDocumentController {

    private final MedicalDocumentRepository repository;
    private final MedicalDocumentMapper mapper;

    public MedicalDocumentController(MedicalDocumentRepository repository, MedicalDocumentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalDocumentDTO>>> getPatientDocuments(@PathVariable Long patientId) {
        List<MedicalDocument> docs = repository.findByPatientIdOrderByUploadDateDesc(patientId);
        List<MedicalDocumentDTO> dtos = docs.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
}
