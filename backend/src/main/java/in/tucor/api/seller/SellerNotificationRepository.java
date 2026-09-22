package in.tucor.api.seller;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface SellerNotificationRepository extends JpaRepository<SellerNotification,UUID>{List<SellerNotification> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);Optional<SellerNotification> findByIdAndSellerId(UUID id,UUID sellerId);}
