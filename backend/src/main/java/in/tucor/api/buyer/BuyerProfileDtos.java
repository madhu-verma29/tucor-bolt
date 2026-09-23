package in.tucor.api.buyer;

import jakarta.validation.constraints.*;

public final class BuyerProfileDtos {
 private BuyerProfileDtos(){}
 private static final String GST="(?i)^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$";
 private static final String PAN="(?i)^$|^[A-Z]{5}[0-9]{4}[A-Z]$";

 public record Profile(String id,String email,String status,String businessName,String tradeName,String businessType,String category,String gstNumber,String registrationNumber,String pan,String cin,String yearEstablished,String website,String address,String city,String state,String pincode,String country,String estimatedVolumeMonthly,String fullName,String phone){}
 public record Update(@NotBlank @Size(max=255) String businessName,@Size(max=255) String tradeName,
                      @NotBlank @Size(max=255) String businessType,@Size(max=150) String category,
                      @NotBlank @Pattern(regexp=GST,message="must be a valid GST number") String gstNumber,
                      @Size(max=80) String registrationNumber,@Pattern(regexp=PAN,message="must be a valid PAN") String pan,
                      @Size(max=30) String cin,@Pattern(regexp="^$|^[0-9]{4}$",message="must be a 4 digit year") String yearEstablished,
                      @Size(max=255) String website,@NotBlank @Size(max=2000) String address,
                      @NotBlank @Size(max=120) String city,@NotBlank @Size(max=120) String state,
                      @Pattern(regexp="^[1-9][0-9]{5}$") String pincode,@Size(max=100) String country,
                      @Size(max=100) String estimatedVolumeMonthly,@NotBlank @Size(max=160) String fullName,
                      @NotBlank @Pattern(regexp="^[6-9][0-9]{9}$") String phone){}
 public record Patch(@Size(max=255) String businessName,@Size(max=255) String tradeName,
                     @Size(max=255) String businessType,@Size(max=150) String category,
                     @Pattern(regexp=GST,message="must be a valid GST number") String gstNumber,
                     @Size(max=80) String registrationNumber,@Pattern(regexp=PAN,message="must be a valid PAN") String pan,
                     @Size(max=30) String cin,@Pattern(regexp="^$|^[0-9]{4}$",message="must be a 4 digit year") String yearEstablished,
                     @Size(max=255) String website,@Size(max=2000) String address,@Size(max=120) String city,
                     @Size(max=120) String state,@Pattern(regexp="^[1-9][0-9]{5}$") String pincode,
                     @Size(max=100) String country,@Size(max=100) String estimatedVolumeMonthly,
                     @Size(max=160) String fullName,@Pattern(regexp="^[6-9][0-9]{9}$") String phone){}
}
