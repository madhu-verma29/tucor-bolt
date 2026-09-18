package in.tucor.api.buyer;
import in.tucor.api.auth.*; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import org.springframework.security.core.Authentication; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.web.bind.annotation.*; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@RestController @RequestMapping("/api/buyer/settings") public class BuyerSettingsController {
 private final UserRepository users; private final RegistrationProfileRepository profiles; private final PasswordEncoder encoder;
 public BuyerSettingsController(UserRepository u,RegistrationProfileRepository p,PasswordEncoder e){users=u;profiles=p;encoder=e;}
 public record Account(String fullName,String email,String phone,String gstNumber,String businessName){}
 public record AccountUpdate(@NotBlank String fullName,@Pattern(regexp="^[6-9][0-9]{9}$") String phone){}
 public record PasswordChange(@NotBlank String currentPassword,@Size(min=8) String newPassword){}
 @GetMapping("/account") public Account account(Authentication a){User u=user(a);RegistrationProfile p=profiles.findById(u.id).orElseThrow();return new Account(p.fullName,u.email,p.phone,p.gstNumber,p.businessName);}
 @PutMapping("/account") @Transactional public Account account(Authentication a,@Valid @RequestBody AccountUpdate r){User u=user(a);RegistrationProfile p=profiles.findById(u.id).orElseThrow();p.fullName=r.fullName();p.phone=r.phone();profiles.save(p);return new Account(p.fullName,u.email,p.phone,p.gstNumber,p.businessName);}
 @PutMapping("/password") @Transactional public void password(Authentication a,@Valid @RequestBody PasswordChange r){User u=user(a);if(!encoder.matches(r.currentPassword(),u.passwordHash))throw new IllegalArgumentException("Current password is incorrect");u.passwordHash=encoder.encode(r.newPassword());u.failedLoginAttempts=0;u.lockedUntil=null;users.save(u);}
 private User user(Authentication a){User u=users.findById(UUID.fromString(a.getName())).orElseThrow();if(u.role!=Role.BUYER)throw new IllegalArgumentException("Buyer account required");return u;}
}