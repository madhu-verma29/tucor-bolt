package in.tucor.api.admin;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_disputes")
public class AdminDispute {
 @Id public UUID id;
 @Column(name="public_id",nullable=false,unique=true) public String publicId;
 @Column(name="order_id",nullable=false,unique=true) public UUID orderId;
 @Column(name="raised_by",nullable=false) public String raisedBy;
 @Column(name="raised_by_role",nullable=false) public String raisedByRole;
 @Column(nullable=false) public String againstParty;
 @Column(nullable=false) public String reason;
 @Column(nullable=false,length=3000) public String description;
 @Column(nullable=false) public String status;
 @Column(nullable=false) public String priority;
 @Column(nullable=false) public BigDecimal amount;
 @Column(length=3000) public String resolution;
 @Column(name="created_at",nullable=false) public Instant createdAt;
 @Column(name="updated_at",nullable=false) public Instant updatedAt;
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(publicId==null)publicId="DSP-"+java.time.LocalDate.now().getYear()+"-"+UUID.randomUUID().toString().substring(0,8).toUpperCase();createdAt=updatedAt=Instant.now();}
 @PreUpdate void update(){updatedAt=Instant.now();}
}
