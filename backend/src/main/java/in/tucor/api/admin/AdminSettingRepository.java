package in.tucor.api.admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface AdminSettingRepository extends JpaRepository<AdminSetting,UUID>{}
