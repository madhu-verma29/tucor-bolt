package in.tucor.api.seller;
import jakarta.persistence.*;import java.math.BigDecimal;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="seller_withdrawals") public class SellerWithdrawal {@Id public UUID id;@Column(name="public_id") public String publicId;@Column(name="seller_id") public UUID sellerId;public BigDecimal amount;public String note;public String status;@Column(name="created_at") public Instant createdAt;@PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}}
