package in.tucor.api.seller;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public final class SellerProfileDtos {
    private SellerProfileDtos() {}

    public record Profile(
            String id, String email, String status, String businessName, String tradeName,
            String businessType, String category, String gstNumber, String fssaiNumber,
            String pan, String cin, String yearEstablished, String website,
            String addressLine1, String addressLine2, String city, String state,
            String pincode, String country, String gstState, String primaryContact,
            String designation, String phone, String altPhone, String altEmail, String contactEmail,
            String kitchenType, String seatingCapacity, String avgDailyCovers,
            String operatingDays, String operatingHours, String cuisineTypes,
            String avgMonthlyUco, String storageCapacity, String collectionFrequency,
            String preferredPickupDay, String pickupContact, String pickupPhone,
            String pickupAvailability, String memberSince) {}

    public record Patch(
            String businessName, String tradeName, String businessType, String category,
            String fssaiNumber, String pan, String cin,
            @Pattern(regexp="^$|^[0-9]{4}$", message="must be a 4 digit year") String yearEstablished,
            String website, String addressLine1, String addressLine2, String city, String state,
            @Pattern(regexp="^[1-9][0-9]{5}$") String pincode, String country, String gstState,
            String primaryContact, String designation,
            @Pattern(regexp="^[+0-9() -]{7,20}$") String phone,
            @Pattern(regexp="^$|^[+0-9() -]{7,20}$") String altPhone,
            @Email String altEmail, @Email String contactEmail, String kitchenType, String seatingCapacity,
            String avgDailyCovers, String operatingDays, String operatingHours,
            String cuisineTypes, String avgMonthlyUco, String storageCapacity,
            String collectionFrequency, String preferredPickupDay, String pickupContact,
            @Pattern(regexp="^$|^[+0-9() -]{7,20}$") String pickupPhone,
            String pickupAvailability) {}
}
