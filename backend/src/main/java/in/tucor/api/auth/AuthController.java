package in.tucor.api.auth;
import jakarta.validation.Valid; import org.springframework.http.*; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController {private final AuthService service;public AuthController(AuthService s){service=s;}
@PostMapping("/register") public ResponseEntity<AuthDtos.Tokens> register(@Valid @RequestBody AuthDtos.Register r){return ResponseEntity.status(201).body(service.register(r));}
@PostMapping("/login") public AuthDtos.Tokens login(@Valid @RequestBody AuthDtos.Login r){return service.login(r);}
@PostMapping("/refresh") public AuthDtos.Tokens refresh(@Valid @RequestBody AuthDtos.Refresh r){return service.rotate(r.refreshToken());}
@PostMapping("/logout") public ResponseEntity<Void> logout(@Valid @RequestBody AuthDtos.Refresh r){service.logout(r.refreshToken());return ResponseEntity.noContent().build();}
@PostMapping("/forgot-password") public AuthDtos.Message forgot(@Valid @RequestBody AuthDtos.EmailRequest r){service.forgotPassword(r.email());return new AuthDtos.Message("If the account exists, a reset email has been sent.");}
@PostMapping("/reset-password") public AuthDtos.Message reset(@Valid @RequestBody AuthDtos.ResetPassword r){service.resetPassword(r.token(),r.password());return new AuthDtos.Message("Password reset successfully.");}
@PostMapping("/verify-email") public AuthDtos.Message verify(@Valid @RequestBody AuthDtos.TokenRequest r){service.verifyEmail(r.token());return new AuthDtos.Message("Email verified successfully.");}
@PostMapping("/resend-verification") public AuthDtos.Message resend(@Valid @RequestBody AuthDtos.EmailRequest r){service.resendVerification(r.email());return new AuthDtos.Message("If verification is pending, a new email has been sent.");}
@GetMapping("/me") public AuthDtos.Me me(Authentication a){User u=service.byId(a.getName());return new AuthDtos.Me(u.id.toString(),u.email,u.role,u.status,u.emailVerified);}}