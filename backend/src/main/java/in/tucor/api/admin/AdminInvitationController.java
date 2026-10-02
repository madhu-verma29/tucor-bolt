package in.tucor.api.admin;
import in.tucor.api.auth.AuthDtos;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth/admin-invitations")
public class AdminInvitationController {
 private final AdminSecurityService security;
 public AdminInvitationController(AdminSecurityService security){this.security=security;}
 public record Accept(@NotBlank String token,@NotBlank @Size(min=8,max=72) String password){}
 @PostMapping("/accept") public AuthDtos.Message accept(@Valid @RequestBody Accept r){security.accept(r.token(),r.password());return new AuthDtos.Message("Admin invitation accepted. You can now sign in.");}
}
