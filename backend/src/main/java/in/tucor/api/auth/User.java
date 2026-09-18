package in.tucor.api.auth;
import jakarta.persistence.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="users") public class User {
@Id public UUID id; @Column(nullable=false,unique=true) public String email; @Column(name="password_hash",nullable=false) public String passwordHash;
@Enumerated(EnumType.STRING) @Column(nullable=false) public Role role; @Column(nullable=false) public String status="ACTIVE";
@Column(name="email_verified",nullable=false) public boolean emailVerified=false; @Column(name="failed_login_attempts",nullable=false) public int failedLoginAttempts=0;
@Column(name="locked_until") public Instant lockedUntil; @Column(name="created_at",nullable=false) public Instant createdAt; @Column(name="updated_at",nullable=false) public Instant updatedAt;
@PrePersist void create(){if(id==null)id=UUID.randomUUID(); createdAt=updatedAt=Instant.now();} @PreUpdate void update(){updatedAt=Instant.now();}
}