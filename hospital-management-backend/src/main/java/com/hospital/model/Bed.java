package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

@Data
@Entity
@Audited
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "beds")
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BedStatus status = BedStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    @JsonIgnoreProperties("beds")
    private Ward ward;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Patient currentPatient;

    public enum BedStatus {
        AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE
    }
}
