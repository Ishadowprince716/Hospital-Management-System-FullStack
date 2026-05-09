package com.hospital.mapper;

import com.hospital.dto.MedicalDocumentDTO;
import com.hospital.model.MedicalDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MedicalDocumentMapper {

    @Mapping(source = "uploadedBy.fullName", target = "uploadedByName")
    MedicalDocumentDTO toDTO(MedicalDocument medicalDocument);

    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "uploadedBy", ignore = true)
    MedicalDocument toEntity(MedicalDocumentDTO medicalDocumentDTO);
}
