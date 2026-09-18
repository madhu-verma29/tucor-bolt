package in.tucor.api.auth; import jakarta.validation.constraints.*;
public final class AuthDtos {private AuthDtos(){}
public record Register(@Email @NotBlank String email,@Size(min=8,max=72) String password,@NotNull Role role){}
public record Login(@Email @NotBlank String email,@NotBlank String password,Boolean rememberMe){}
public record Refresh(@NotBlank String refreshToken){}
public record EmailRequest(@Email @NotBlank String email){}
public record TokenRequest(@NotBlank String token){}
public record ResetPassword(@NotBlank String token,@Size(min=8,max=72) String password){}
public record Message(String message){}
public record Tokens(String accessToken,String refreshToken,String tokenType,long expiresInSeconds,Role role,String email){}
public record Me(String id,String email,Role role,String status,boolean emailVerified){}
}