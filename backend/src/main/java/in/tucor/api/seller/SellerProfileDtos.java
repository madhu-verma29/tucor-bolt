package in.tucor.api.seller;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
            @Size(max=255) String businessName, @Size(max=255) String tradeName, @Size(max=100) String businessType, @Size(max=150) String category,
            @Size(max=40) @Pattern(regexp="^$|^[0-9]{14}$") String fssaiNumber, @Pattern(regexp="^$|^[A-Z]{5}[0-9]{4}[A-Z]$") String pan, @Size(max=30) String cin,
            @Pattern(regexp="^$|^[0-9]{4}$", message="must be a 4 digit year") String yearEstablished,
            @Size(max=255) String website, @Size(max=500) String addressLine1, @Size(max=500) String addressLine2, @Size(max=100) String city, @Size(max=100) String state,
            @Pattern(regexp="^[1-9][0-9]{5}$") String pincode, @Size(max=100) String country, @Size(max=120) String gstState,
            @Size(max=160) String primaryContact, @Size(max=160) String designation,
            @Pattern(regexp="^[+0-9() -]{7,20}$") String phone,
            @Pattern(regexp="^$|^[+0-9() -]{7,20}$") String altPhone,
            @Email @Size(max=255) String altEmail, @Email @Size(max=255) String contactEmail, @Size(max=160) String kitchenType, @Size(max=40) String seatingCapacity,
            @Size(max=40) String avgDailyCovers, @Size(max=160) String operatingDays, @Size(max=160) String operatingHours,
            @Size(max=500) String cuisineTypes, @Size(max=40) String avgMonthlyUco, @Size(max=40) String storageCapacity,
            @Size(max=80) String collectionFrequency, @Size(max=80) String preferredPickupDay, @Size(max=160) String pickupContact,
            @Pattern(regexp="^$|^[+0-9() -]{7,20}$") String pickupPhone,
            @Size(max=160) String pickupAvailability) {}
}
