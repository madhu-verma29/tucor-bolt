package in.tucor.api.admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AdminDisputeEventRepository extends JpaRepository<AdminDisputeEvent,UUID>{List<AdminDisputeEvent> findByDisputeIdOrderByCreatedAtAsc(UUID disputeId);}
