package in.tucor.api.admin;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_logs")
public class AdminAuditLog {
 @Id public UUID id;
 @Column(name = "public_id", nullable = false, unique = true) public String publicId;
 @Column(name = "actor_id") public UUID actorId;
 @Column(nullable = false) public String actor;
 @Column(name = "actor_role", nullable = false) public String actorRole;
 @Column(nullable = false) public String action;
 @Column(nullable = false) public String module;
 @Column(nullable = false) public String target;
 @Column(name = "target_id", nullable = false) public String targetId;
 @Column(name = "ip_address", nullable = false) public String ipAddress;
 @Column(nullable = false) public String severity;
 @Column(nullable = false, length = 2000) public String details;
 @Column(name = "created_at", nullable = false) public Instant createdAt;
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(publicId==null)publicId="LOG-"+Instant.now().toEpochMilli()+"-"+UUID.randomUUID().toString().substring(0,6).toUpperCase();if(createdAt==null)createdAt=Instant.now();}
}
