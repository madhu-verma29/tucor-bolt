package in.tucor.api.seller;

import in.tucor.api.auth.*;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SellerProfileServiceTest {
    @Test
    void patchUpdatesSellerFieldsAndPreservesOmittedValues() {
        UUID id=UUID.randomUUID();UserRepository users=mock(UserRepository.class);RegistrationProfileRepository profiles=mock(RegistrationProfileRepository.class);User user=seller(id);RegistrationProfile profile=profile(id);
        when(users.findById(id)).thenReturn(Optional.of(user));when(profiles.findById(id)).thenReturn(Optional.of(profile));when(profiles.save(any())).thenAnswer(i->i.getArgument(0));
        SellerProfileService service=new SellerProfileService(users,profiles);
        SellerProfileDtos.Profile result=service.patch(id.toString(),patch("Updated Kitchen","Weekly","Ravi Kumar"));
        assertEquals("Updated Kitchen",result.businessName());assertEquals("Weekly",result.collectionFrequency());assertEquals("Ravi Kumar",result.pickupContact());assertEquals("27ABCDE1234F1Z5",result.gstNumber());assertEquals("Mumbai",result.city());verify(profiles).save(profile);
    }

    @Test
    void patchRejectsBuyerAccount() {
        UUID id=UUID.randomUUID();UserRepository users=mock(UserRepository.class);RegistrationProfileRepository profiles=mock(RegistrationProfileRepository.class);User user=seller(id);user.role=Role.BUYER;when(users.findById(id)).thenReturn(Optional.of(user));
        IllegalArgumentException error=assertThrows(IllegalArgumentException.class,()->new SellerProfileService(users,profiles).patch(id.toString(),patch("Name",null,null)));
        assertEquals("Seller account required",error.getMessage());
    }

    private static SellerProfileDtos.Patch patch(String businessName,String frequency,String pickupContact){return new SellerProfileDtos.Patch(
            businessName,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,
            null,null,null,null,null,null,null,null,null,null,null,null,null,null,frequency,null,
            pickupContact,null,null);}
    private static User seller(UUID id){User u=new User();u.id=id;u.email="seller@tucor.test";u.role=Role.SELLER;u.status="ACTIVE";u.createdAt=Instant.now();return u;}
    private static RegistrationProfile profile(UUID id){RegistrationProfile p=new RegistrationProfile();p.userId=id;p.businessName="Original Kitchen";p.businessType="Restaurant";p.gstNumber="27ABCDE1234F1Z5";p.address="1 Market Road";p.city="Mumbai";p.state="Maharashtra";p.pincode="400001";p.country="India";p.fullName="Seller User";p.phone="9876543210";return p;}
}
