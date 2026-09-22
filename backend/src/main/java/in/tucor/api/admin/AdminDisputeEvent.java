package in.tucor.api.admin;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="admin_dispute_events") public class AdminDisputeEvent {@Id public UUID id;@Column(name="dispute_id",nullable=false) public UUID disputeId;@Column(nullable=false) public String action;@Column(name="actor_name",nullable=false) public String actorName;@Column(name="created_at",nullable=false) public Instant createdAt;@PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}}
