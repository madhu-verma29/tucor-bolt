package in.tucor.api.admin;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface AdminDocumentRequestRepository extends JpaRepository<AdminDocumentRequest,UUID>{List<AdminDocumentRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);@Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @Query("select r from AdminDocumentRequest r where r.id=:id") Optional<AdminDocumentRequest> findByIdForUpdate(UUID id);}
