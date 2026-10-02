package in.tucor.api.admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AdminDisputeRepository extends JpaRepository<AdminDispute,UUID>{Optional<AdminDispute> findByPublicId(String publicId);@org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @org.springframework.data.jpa.repository.Query("select d from AdminDispute d where d.publicId=:publicId") Optional<AdminDispute> findByPublicIdForUpdate(String publicId);List<AdminDispute> findByPublicIdContainingIgnoreCase(String query,org.springframework.data.domain.Pageable page);Optional<AdminDispute> findByOrderId(UUID orderId);List<AdminDispute> findAllByOrderByUpdatedAtDesc();}
