package in.tucor.api.buyer;

import in.tucor.api.auth.RegistrationProfile;
import in.tucor.api.auth.RegistrationProfileRepository;
import in.tucor.api.auth.Role;
import in.tucor.api.auth.User;
import in.tucor.api.auth.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BuyerProfileServiceTest {

    @Test
    void patchUpdatesProvidedFieldsAndPreservesTheRest() {
        UUID buyerId = UUID.randomUUID();
        UserRepository users = mock(UserRepository.class);
        RegistrationProfileRepository profiles = mock(RegistrationProfileRepository.class);
        User user = buyer(buyerId);
        RegistrationProfile profile = profile(buyerId);

        when(users.findById(buyerId)).thenReturn(Optional.of(user));
        when(profiles.findById(buyerId)).thenReturn(Optional.of(profile));
        when(profiles.save(any(RegistrationProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BuyerProfileService service = new BuyerProfileService(users, profiles);
        BuyerProfileDtos.Profile updated = service.patch(buyerId.toString(), patch("Updated Biofuel Pvt Ltd", "Mumbai", ""));

        assertEquals("Updated Biofuel Pvt Ltd", updated.businessName());
        assertEquals("Mumbai", updated.city());
        assertNull(updated.tradeName());
        assertEquals("29ABCDE1234F1Z5", updated.gstNumber());
        assertEquals("560001", updated.pincode());
        verify(profiles).save(profile);
    }

    @Test
    void patchRejectsBlankRequiredField() {
        UUID buyerId = UUID.randomUUID();
        UserRepository users = mock(UserRepository.class);
        RegistrationProfileRepository profiles = mock(RegistrationProfileRepository.class);

        when(users.findById(buyerId)).thenReturn(Optional.of(buyer(buyerId)));
        when(profiles.findById(buyerId)).thenReturn(Optional.of(profile(buyerId)));

        BuyerProfileService service = new BuyerProfileService(users, profiles);
        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> service.patch(buyerId.toString(), patch("   ", null, null))
        );

        assertEquals("Business name is required", error.getMessage());
    }

    private static BuyerProfileDtos.Patch patch(String businessName, String city, String tradeName) {
        return new BuyerProfileDtos.Patch(
                businessName, tradeName, null, null, null, null, null, null, null,
                null, null, city, null, null, null, null, null, null
        );
    }

    private static User buyer(UUID id) {
        User user = new User();
        user.id = id;
        user.email = "buyer@tucor.test";
        user.role = Role.BUYER;
        user.status = "ACTIVE";
        return user;
    }

    private static RegistrationProfile profile(UUID id) {
        RegistrationProfile profile = new RegistrationProfile();
        profile.userId = id;
        profile.businessName = "Original Biofuel Pvt Ltd";
        profile.tradeName = "Original Trade Name";
        profile.businessType = "Private Limited";
        profile.gstNumber = "29ABCDE1234F1Z5";
        profile.address = "1 Industrial Road";
        profile.city = "Bengaluru";
        profile.state = "Karnataka";
        profile.pincode = "560001";
        profile.country = "India";
        profile.fullName = "Buyer User";
        profile.phone = "9876543210";
        return profile;
    }
}
