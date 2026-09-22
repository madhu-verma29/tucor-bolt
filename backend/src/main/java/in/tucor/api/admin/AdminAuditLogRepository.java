package in.tucor.api.admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog,UUID>{List<AdminAuditLog> findTop250ByOrderByCreatedAtDesc();}
