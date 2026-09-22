package in.tucor.api.seller;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface SellerBankAccountRepository extends JpaRepository<SellerBankAccount, UUID> {}
