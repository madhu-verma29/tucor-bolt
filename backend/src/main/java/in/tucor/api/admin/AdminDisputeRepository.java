package in.tucor.api.admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AdminDisputeRepository extends JpaRepository<AdminDispute,UUID>{Optional<AdminDispute> findByPublicId(String publicId);Optional<AdminDispute> findByOrderId(UUID orderId);List<AdminDispute> findAllByOrderByUpdatedAtDesc();}
