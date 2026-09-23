package in.tucor.api.buyer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BuyerProcurementPreferenceRepository extends JpaRepository<BuyerProcurementPreference, UUID> {}
