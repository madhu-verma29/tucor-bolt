package in.tucor.api.seller;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface SellerListingDocumentRepository extends JpaRepository<SellerListingDocument,UUID>{List<SellerListingDocument> findByListingIdOrderByCreatedAtDesc(UUID listingId);Optional<SellerListingDocument> findByIdAndListingId(UUID id,UUID listingId);}
