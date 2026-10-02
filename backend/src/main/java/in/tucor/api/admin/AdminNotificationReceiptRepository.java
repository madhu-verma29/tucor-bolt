package in.tucor.api.admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AdminNotificationReceiptRepository extends JpaRepository<AdminNotificationReceipt,UUID>{List<AdminNotificationReceipt> findByAdminIdAndAlertIdIn(UUID adminId,Collection<String> ids);Optional<AdminNotificationReceipt> findByAdminIdAndAlertId(UUID adminId,String id);}
