package in.tucor.api.buyer;

import in.tucor.api.auth.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/buyer/settings")
public class BuyerSettingsController {
 private final UserRepository users;
 private final RegistrationProfileRepository profiles;
 private final PasswordEncoder encoder;
 private final BuyerNotificationPreferenceRepository notifications;
 private final BuyerProcurementPreferenceRepository procurementPreferences;
 private final RefreshTokenRepository refreshTokens;

 public BuyerSettingsController(UserRepository users, RegistrationProfileRepository profiles, PasswordEncoder encoder,
                                BuyerNotificationPreferenceRepository notifications,
                                BuyerProcurementPreferenceRepository procurementPreferences,
                                RefreshTokenRepository refreshTokens) {
  this.users = users;
  this.profiles = profiles;
  this.encoder = encoder;
  this.notifications = notifications;
  this.procurementPreferences = procurementPreferences;
  this.refreshTokens = refreshTokens;
 }

 public record Account(String fullName,String email,String phone,String gstNumber,String businessName){}
 public record AccountUpdate(@NotBlank @Size(max=160) String fullName,@NotBlank @Pattern(regexp="^[6-9][0-9]{9}$") String phone){}
 public record Notifications(boolean emailOrders,boolean emailPickups,boolean emailPayments,boolean smsPickups,boolean smsPayments,boolean appAll){}
 public record Contacts(@NotBlank @Size(max=160) String primaryName,@Size(max=160) String primaryRole,
                        @NotBlank @Pattern(regexp="^[6-9][0-9]{9}$") String primaryPhone,@Email @NotBlank @Size(max=255) String primaryEmail,
                        @Size(max=160) String altName,@Size(max=160) String altRole,
                        @Pattern(regexp="^$|^[6-9][0-9]{9}$") String altPhone,@Email @Size(max=255) String altEmail,
                        @Size(max=2000) String warehouseAddress,@Pattern(regexp="^$|^[6-9][0-9]{9}$") String warehouseContact,
                        @Size(max=160) String warehouseHours){}
 public record PasswordChange(@NotBlank String currentPassword,@Size(min=8,max=72) String newPassword){}
 public record Preferences(boolean emailOrders,boolean emailPickups,boolean emailPayments,boolean emailKyc,boolean smsOrders,boolean smsPickups,
                           boolean whatsappUpdates,boolean autoReorder,boolean priceAlerts,boolean weeklyReport,
                           boolean sustainabilityReport,boolean compactView,
                           @NotBlank @Size(max=20) String preferredGrade,@NotBlank @Size(max=20) String maxFfa,
                           @NotBlank @Size(max=40) String minVolume,@NotBlank @Size(max=40) String maxPrice,
                           @Size(max=500) String preferredRegions,@NotBlank @Size(max=10) String currency,
                           @NotBlank @Size(max=40) String language,boolean marketingEmails){}

 @GetMapping("/account")
 public Account account(Authentication authentication){User u=user(authentication);RegistrationProfile p=profile(u.id);return accountDto(u,p);}

 @PutMapping("/account")
 @Transactional
 public Account account(Authentication authentication,@Valid @RequestBody AccountUpdate request){
  User u=user(authentication);RegistrationProfile p=profile(u.id);
  p.fullName=required(request.fullName());p.phone=request.phone();profiles.save(p);
  return accountDto(u,p);
 }

 @GetMapping("/notifications")
 @Transactional
 public Notifications notifications(Authentication authentication){return notificationDto(notification(user(authentication).id));}

 @PutMapping("/notifications")
 @Transactional
 public Notifications notifications(Authentication authentication,@RequestBody Notifications request){
  BuyerNotificationPreference p=notification(user(authentication).id);
  p.emailOrders=request.emailOrders();p.emailPickups=request.emailPickups();p.emailPayments=request.emailPayments();
  p.smsPickups=request.smsPickups();p.smsPayments=request.smsPayments();p.appAll=request.appAll();
  return notificationDto(notifications.save(p));
 }

 @GetMapping("/preferences")
 @Transactional
 public Preferences preferences(Authentication authentication){
  UUID buyerId=user(authentication).id;
  return preferencesDto(notification(buyerId),procurement(buyerId));
 }

 @PutMapping("/preferences")
 @Transactional
 public Preferences preferences(Authentication authentication,@Valid @RequestBody Preferences request){
  UUID buyerId=user(authentication).id;
  BuyerNotificationPreference n=notification(buyerId);
  n.emailOrders=request.emailOrders();n.emailPickups=request.emailPickups();n.emailPayments=request.emailPayments();n.emailKyc=request.emailKyc();
  n.smsOrders=request.smsOrders();n.smsPickups=request.smsPickups();n.whatsappUpdates=request.whatsappUpdates();
  n.marketingEmails=request.marketingEmails();
  BuyerProcurementPreference p=procurement(buyerId);
  p.autoReorder=request.autoReorder();p.priceAlerts=request.priceAlerts();p.weeklyReport=request.weeklyReport();
  p.sustainabilityReport=request.sustainabilityReport();p.compactView=request.compactView();
  p.preferredGrade=required(request.preferredGrade());p.maxFfa=required(request.maxFfa());
  p.minVolume=required(request.minVolume());p.maxPrice=required(request.maxPrice());
  p.preferredRegions=optional(request.preferredRegions());p.currency=required(request.currency());p.language=required(request.language());
  return preferencesDto(notifications.save(n),procurementPreferences.save(p));
 }

 @GetMapping("/contacts")
 public Contacts contacts(Authentication authentication){User u=user(authentication);return contactDto(u,profile(u.id));}

 @PutMapping("/contacts")
 @Transactional
 public Contacts contacts(Authentication authentication,@Valid @RequestBody Contacts request){
  User u=user(authentication);RegistrationProfile p=profile(u.id);
  p.fullName=required(request.primaryName());p.primaryRole=optional(request.primaryRole());p.phone=request.primaryPhone();
  p.primaryEmail=request.primaryEmail().trim().toLowerCase(Locale.ROOT);p.alternateName=optional(request.altName());
  p.alternateRole=optional(request.altRole());p.alternatePhone=optional(request.altPhone());
  p.alternateEmail=optional(request.altEmail()).toLowerCase(Locale.ROOT);p.warehouseAddress=optional(request.warehouseAddress());
  p.warehouseContact=optional(request.warehouseContact());p.warehouseHours=optional(request.warehouseHours());
  profiles.save(p);return contactDto(u,p);
 }

 @PutMapping("/password")
 @Transactional
 public void password(Authentication authentication,@Valid @RequestBody PasswordChange request){
  User u=user(authentication);
  if(!encoder.matches(request.currentPassword(),u.passwordHash))throw new IllegalArgumentException("Current password is incorrect");
  if(encoder.matches(request.newPassword(),u.passwordHash))throw new IllegalArgumentException("New password must be different from the current password");
  u.passwordHash=encoder.encode(request.newPassword());u.failedLoginAttempts=0;u.lockedUntil=null;users.save(u);
  Instant now=Instant.now();var active=refreshTokens.findByUserIdAndRevokedAtIsNull(u.id);
  active.forEach(t->t.revokedAt=now);refreshTokens.saveAll(active);
 }

 private Account accountDto(User u,RegistrationProfile p){return new Account(p.fullName,u.email,p.phone,p.gstNumber,p.businessName);}
 private Notifications notificationDto(BuyerNotificationPreference p){return new Notifications(p.emailOrders,p.emailPickups,p.emailPayments,p.smsPickups,p.smsPayments,p.appAll);}
 private Preferences preferencesDto(BuyerNotificationPreference n,BuyerProcurementPreference p){return new Preferences(n.emailOrders,n.emailPickups,n.emailPayments,n.emailKyc,n.smsOrders,n.smsPickups,n.whatsappUpdates,p.autoReorder,p.priceAlerts,p.weeklyReport,p.sustainabilityReport,p.compactView,p.preferredGrade,p.maxFfa,p.minVolume,p.maxPrice,p.preferredRegions,p.currency,p.language,n.marketingEmails);}
 private Contacts contactDto(User u,RegistrationProfile p){return new Contacts(p.fullName,p.primaryRole,p.phone,p.primaryEmail==null?u.email:p.primaryEmail,p.alternateName,p.alternateRole,p.alternatePhone,p.alternateEmail,p.warehouseAddress==null?p.address+", "+p.city+", "+p.state+" "+p.pincode:p.warehouseAddress,p.warehouseContact,p.warehouseHours);}
 private BuyerNotificationPreference notification(UUID id){return notifications.findById(id).orElseGet(()->{BuyerNotificationPreference p=new BuyerNotificationPreference();p.buyerId=id;return notifications.save(p);});}
 private BuyerProcurementPreference procurement(UUID id){return procurementPreferences.findById(id).orElseGet(()->{BuyerProcurementPreference p=new BuyerProcurementPreference();p.buyerId=id;return procurementPreferences.save(p);});}
 private RegistrationProfile profile(UUID id){return profiles.findById(id).orElseThrow(()->new IllegalArgumentException("Buyer profile not found"));}
 private User user(Authentication authentication){User u=users.findById(UUID.fromString(authentication.getName())).orElseThrow();if(u.role!=Role.BUYER)throw new IllegalArgumentException("Buyer account required");return u;}
 private String required(String value){return value.trim();}
 private String optional(String value){return value==null?"":value.trim();}
}
