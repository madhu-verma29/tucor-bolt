package in.tucor.api.auth;
import jakarta.persistence.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="registration_documents") public class RegistrationDocument {
@Id public UUID id; @Column(name="user_id",nullable=false) public UUID userId; @Column(name="document_type",nullable=false) public String documentType; @Column(name="original_filename",nullable=false) public String originalFilename; @Column(name="stored_filename",nullable=false) public String storedFilename; @Column(name="content_type",nullable=false) public String contentType; @Column(name="size_bytes",nullable=false) public long sizeBytes; @Column(nullable=false) public String status="PENDING_REVIEW"; @Column(name="created_at",nullable=false) public Instant createdAt;
@PrePersist void create(){if(id==null)id=UUID.randomUUID();createdAt=Instant.now();}
}