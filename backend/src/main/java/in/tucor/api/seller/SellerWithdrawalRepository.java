package in.tucor.api.seller;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface SellerWithdrawalRepository extends JpaRepository<SellerWithdrawal,UUID>{List<SellerWithdrawal> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);}
