package in.tucor.api.seller;

import in.tucor.api.auth.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SellerProfileService {
    private final UserRepository users;
    private final RegistrationProfileRepository profiles;

    public SellerProfileService(UserRepository users, RegistrationProfileRepository profiles) {
        this.users = users;
        this.profiles = profiles;
    }

    @Transactional(readOnly = true)
    public SellerProfileDtos.Profile get(String id) {
        User user = seller(id);
        return dto(user, profile(user));
    }

    @Transactional
    public SellerProfileDtos.Profile patch(String id, SellerProfileDtos.Patch r) {
        User user = seller(id);
        RegistrationProfile p = profile(user);
        if (r.businessName() != null) p.businessName = required(r.businessName(), "Business name");
        if (r.tradeName() != null) p.tradeName = optional(r.tradeName());
        if (r.businessType() != null) p.businessType = required(r.businessType(), "Business type");
        if (r.category() != null) p.category = optional(r.category());
        if (r.fssaiNumber() != null) p.fssaiNumber = optional(r.fssaiNumber());
        if (r.pan() != null) p.pan = optional(r.pan());
        if (r.cin() != null) p.cin = optional(r.cin());
        if (r.yearEstablished() != null) p.yearEstablished = optional(r.yearEstablished());
        if (r.website() != null) p.website = optional(r.website());
        if (r.addressLine1() != null) p.address = required(r.addressLine1(), "Address");
        if (r.addressLine2() != null) p.addressLine2 = optional(r.addressLine2());
        if (r.city() != null) p.city = required(r.city(), "City");
        if (r.state() != null) p.state = required(r.state(), "State");
        if (r.pincode() != null) p.pincode = r.pincode();
        if (r.country() != null) p.country = r.country().isBlank() ? "India" : r.country().trim();
        if (r.gstState() != null) p.gstState = optional(r.gstState());
        if (r.primaryContact() != null) p.fullName = required(r.primaryContact(), "Primary contact");
        if (r.designation() != null) p.primaryRole = optional(r.designation());
        if (r.phone() != null) p.phone = r.phone().trim();
        if (r.altPhone() != null) p.alternatePhone = optional(r.altPhone());
        if (r.altEmail() != null) p.alternateEmail = optional(r.altEmail());
        if (r.contactEmail() != null) p.primaryEmail = optional(r.contactEmail());
        if (r.kitchenType() != null) p.kitchenType = optional(r.kitchenType());
        if (r.seatingCapacity() != null) p.seatingCapacity = optional(r.seatingCapacity());
        if (r.avgDailyCovers() != null) p.avgDailyCovers = optional(r.avgDailyCovers());
        if (r.operatingDays() != null) p.operatingDays = optional(r.operatingDays());
        if (r.operatingHours() != null) p.operatingHours = optional(r.operatingHours());
        if (r.cuisineTypes() != null) p.cuisineTypes = optional(r.cuisineTypes());
        if (r.avgMonthlyUco() != null) p.avgMonthlyUco = optional(r.avgMonthlyUco());
        if (r.storageCapacity() != null) p.storageCapacity = optional(r.storageCapacity());
        if (r.collectionFrequency() != null) p.collectionFrequency = optional(r.collectionFrequency());
        if (r.preferredPickupDay() != null) p.preferredPickupDay = optional(r.preferredPickupDay());
        if (r.pickupContact() != null) p.pickupContact = optional(r.pickupContact());
        if (r.pickupPhone() != null) p.pickupPhone = optional(r.pickupPhone());
        if (r.pickupAvailability() != null) p.pickupAvailability = optional(r.pickupAvailability());
        return dto(user, profiles.save(p));
    }

    private User seller(String id) {
        User user = users.findById(UUID.fromString(id)).orElseThrow();
        if (user.role != Role.SELLER) throw new IllegalArgumentException("Seller account required");
        return user;
    }

    private RegistrationProfile profile(User user) {
        return profiles.findById(user.id).orElseThrow(() -> new IllegalArgumentException("Seller profile not found"));
    }

    private String required(String value, String field) {
        String cleaned = value.trim();
        if (cleaned.isEmpty()) throw new IllegalArgumentException(field + " is required");
        return cleaned;
    }

    private String optional(String value) {
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }

    private SellerProfileDtos.Profile dto(User u, RegistrationProfile p) {
        return new SellerProfileDtos.Profile(u.id.toString(), u.email, u.status, p.businessName,
                p.tradeName, p.businessType, p.category, p.gstNumber, p.fssaiNumber == null ? p.registrationNumber : p.fssaiNumber, p.pan, p.cin,
                p.yearEstablished, p.website, p.address, p.addressLine2, p.city, p.state, p.pincode,
                p.country, p.gstState, p.fullName, p.primaryRole, p.phone, p.alternatePhone, p.alternateEmail,
                p.primaryEmail == null ? u.email : p.primaryEmail, p.kitchenType, p.seatingCapacity,
                p.avgDailyCovers, p.operatingDays, p.operatingHours, p.cuisineTypes,
                p.avgMonthlyUco == null ? p.estimatedVolumeMonthly : p.avgMonthlyUco,
                p.storageCapacity, p.collectionFrequency, p.preferredPickupDay, p.pickupContact,
                p.pickupPhone, p.pickupAvailability, u.createdAt == null ? null : u.createdAt.toString());
    }
}
