package in.tucor.api.seller;

import in.tucor.api.auth.*;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import org.springframework.http.HttpStatus;import org.springframework.security.core.Authentication;import org.springframework.security.crypto.password.PasswordEncoder;import org.springframework.transaction.annotation.Transactional;import org.springframework.web.bind.annotation.*;import java.util.UUID;

@RestController @RequestMapping("/api/seller/settings") public class SellerSettingsController {
 private final UserRepository users;private final RegistrationProfileRepository profiles;private final SellerPreferenceRepository prefs;private final PasswordEncoder encoder;
 public SellerSettingsController(UserRepository users,RegistrationProfileRepository profiles,SellerPreferenceRepository prefs,PasswordEncoder encoder){this.users=users;this.profiles=profiles;this.prefs=prefs;this.encoder=encoder;}
 public record Account(String fullName,String email,String phone,String gstNumber,String businessName){}
 public record AccountUpdate(@NotBlank String fullName,@Email @NotBlank String email,@Pattern(regexp="^[+0-9() -]{7,20}$") String phone){}
 public record Notifications(boolean emailOrders,boolean emailPickups,boolean emailPayments,boolean smsPickups,boolean smsPayments,boolean appAll){}
 public record Preferences(boolean twoFactor,boolean loginAlerts,boolean autoInvoice,boolean weeklyReport){}
 public record PasswordChange(@NotBlank String currentPassword,@Size(min=8) String newPassword){}
 @GetMapping("/account") public Account account(Authentication a){User u=user(a);RegistrationProfile p=profile(u);return accountDto(u,p);}
 @PutMapping("/account") @Transactional public Account account(Authentication a,@Valid @RequestBody AccountUpdate r){User u=user(a);RegistrationProfile p=profile(u);p.fullName=r.fullName().trim();p.primaryEmail=r.email().trim().toLowerCase();p.phone=r.phone().trim();return accountDto(u,profiles.save(p));}
 @GetMapping("/notifications") public Notifications notifications(Authentication a){return notifications(preference(user(a).id));}
 @PutMapping("/notifications") @Transactional public Notifications notifications(Authentication a,@RequestBody Notifications r){SellerPreference p=preference(user(a).id);p.emailOrders=r.emailOrders();p.emailPickups=r.emailPickups();p.emailPayments=r.emailPayments();p.smsPickups=r.smsPickups();p.smsPayments=r.smsPayments();p.appAll=r.appAll();return notifications(prefs.save(p));}
 @GetMapping("/preferences") public Preferences preferences(Authentication a){return preferences(preference(user(a).id));}
 @PutMapping("/preferences") @Transactional public Preferences preferences(Authentication a,@RequestBody Preferences r){SellerPreference p=preference(user(a).id);p.twoFactor=r.twoFactor();p.loginAlerts=r.loginAlerts();p.autoInvoice=r.autoInvoice();p.weeklyReport=r.weeklyReport();return preferences(prefs.save(p));}
 @PutMapping("/password") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional public void password(Authentication a,@Valid @RequestBody PasswordChange r){User u=user(a);if(!encoder.matches(r.currentPassword(),u.passwordHash))throw new IllegalArgumentException("Current password is incorrect");if(encoder.matches(r.newPassword(),u.passwordHash))throw new IllegalArgumentException("New password must be different from the current password");u.passwordHash=encoder.encode(r.newPassword());u.failedLoginAttempts=0;u.lockedUntil=null;users.save(u);}
 private SellerPreference preference(UUID id){return prefs.findById(id).orElseGet(()->{SellerPreference p=new SellerPreference();p.userId=id;return prefs.save(p);});}
 private User user(Authentication a){User u=users.findById(UUID.fromString(a.getName())).orElseThrow();if(u.role!=Role.SELLER)throw new IllegalArgumentException("Seller account required");return u;}
 private RegistrationProfile profile(User u){return profiles.findById(u.id).orElseThrow(()->new IllegalArgumentException("Seller profile not found"));}
 private Account accountDto(User u,RegistrationProfile p){return new Account(p.fullName,p.primaryEmail==null?u.email:p.primaryEmail,p.phone,p.gstNumber,p.businessName);}
 private Notifications notifications(SellerPreference p){return new Notifications(p.emailOrders,p.emailPickups,p.emailPayments,p.smsPickups,p.smsPayments,p.appAll);}
 private Preferences preferences(SellerPreference p){return new Preferences(p.twoFactor,p.loginAlerts,p.autoInvoice,p.weeklyReport);}
}
