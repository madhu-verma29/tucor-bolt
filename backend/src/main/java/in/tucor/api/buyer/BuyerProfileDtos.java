package in.tucor.api.buyer;
import jakarta.validation.constraints.*;
public final class BuyerProfileDtos { private BuyerProfileDtos(){}
public record Profile(String id,String email,String status,String businessName,String tradeName,String businessType,String category,String gstNumber,String registrationNumber,String pan,String cin,String yearEstablished,String website,String address,String city,String state,String pincode,String country,String estimatedVolumeMonthly,String fullName,String phone){}
public record Update(@NotBlank String businessName,String tradeName,@NotBlank String businessType,String category,@NotBlank String gstNumber,String registrationNumber,String pan,String cin,String yearEstablished,String website,@NotBlank String address,@NotBlank String city,@NotBlank String state,@Pattern(regexp="^[1-9][0-9]{5}$") String pincode,String country,String estimatedVolumeMonthly,@NotBlank String fullName,@Pattern(regexp="^[6-9][0-9]{9}$") String phone){}
public record Patch(
 String businessName,
 String tradeName,
 String businessType,
 String category,
 String gstNumber,
 String registrationNumber,
 String pan,
 String cin,
 @Pattern(regexp="^$|^[0-9]{4}$",message="must be a 4 digit year") String yearEstablished,
 String website,
 String address,
 String city,
 String state,
 @Pattern(regexp="^[1-9][0-9]{5}$") String pincode,
 String country,
 String estimatedVolumeMonthly,
 String fullName,
 @Pattern(regexp="^[6-9][0-9]{9}$") String phone){}
}
