package in.tucor.api.buyer;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "buyer_procurement_preferences")
public class BuyerProcurementPreference {
 @Id @Column(name = "buyer_id") public UUID buyerId;
 @Column(name = "auto_reorder", nullable = false) public boolean autoReorder;
 @Column(name = "price_alerts", nullable = false) public boolean priceAlerts = true;
 @Column(name = "weekly_report", nullable = false) public boolean weeklyReport = true;
 @Column(name = "sustainability_report", nullable = false) public boolean sustainabilityReport;
 @Column(name = "compact_view", nullable = false) public boolean compactView;
 @Column(name = "preferred_grade", nullable = false) public String preferredGrade = "Grade A";
 @Column(name = "max_ffa", nullable = false) public String maxFfa = "3%";
 @Column(name = "min_volume", nullable = false) public String minVolume = "500 L";
 @Column(name = "max_price", nullable = false) public String maxPrice = "₹55/L";
 @Column(name = "preferred_regions", nullable = false, length = 500) public String preferredRegions = "";
 @Column(nullable = false) public String currency = "INR";
 @Column(nullable = false) public String language = "English";
 @Column(name = "updated_at", nullable = false) public Instant updatedAt;
 @PrePersist @PreUpdate void touch(){updatedAt=Instant.now();}
}
