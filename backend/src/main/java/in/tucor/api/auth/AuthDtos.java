package in.tucor.api.auth; import jakarta.validation.constraints.*;
public final class AuthDtos {private AuthDtos(){}
public record Register(@Email @NotBlank String email,@Size(min=8,max=72) String password,@NotNull Role role,@NotBlank String businessName,@NotBlank String businessType,@NotBlank String gstNumber,String registrationNumber,@NotBlank String address,@NotBlank String city,@NotBlank String state,@Pattern(regexp="^[1-9][0-9]{5}$") String pincode,String estimatedVolumeMonthly,@NotBlank String fullName,@Pattern(regexp="^[6-9][0-9]{9}$") String phone){}
public record Login(@Email @NotBlank String email,@NotBlank String password,Boolean rememberMe){}
public record Refresh(@NotBlank String refreshToken){}
public record EmailRequest(@Email @NotBlank String email){}
public record TokenRequest(@NotBlank String token){}
public record ResetPassword(@NotBlank String token,@Size(min=8,max=72) String password){}
public record Message(String message){}
public record Tokens(String accessToken,String refreshToken,String tokenType,long expiresInSeconds,Role role,String email){}
public record Me(String id,String email,Role role,String status,boolean emailVerified){}
}