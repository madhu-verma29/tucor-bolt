package in.tucor.api.seller;
import jakarta.persistence.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="seller_notifications") public class SellerNotification {@Id public UUID id;@Column(name="seller_id") public UUID sellerId;public String type;public String title;public String message;@Column(name="is_read") public boolean read;@Column(name="created_at") public Instant createdAt;@PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}}
