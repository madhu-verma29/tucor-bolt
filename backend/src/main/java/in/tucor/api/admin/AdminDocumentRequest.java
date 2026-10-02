package in.tucor.api.admin;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="admin_document_requests")
public class AdminDocumentRequest {
 @Id public UUID id;@Column(name="user_id",nullable=false) public UUID userId;@Column(name="requested_by",nullable=false) public UUID requestedBy;
 @Column(nullable=false,length=2000) public String message;@Column(nullable=false) public String status="Open";
 @Column(name="created_at",nullable=false) public Instant createdAt;@Column(name="updated_at",nullable=false) public Instant updatedAt;
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();createdAt=updatedAt=Instant.now();}@PreUpdate void update(){updatedAt=Instant.now();}
}
