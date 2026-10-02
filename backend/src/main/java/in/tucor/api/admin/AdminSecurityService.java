package in.tucor.api.admin;
import in.tucor.api.auth.*;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.*;
import java.util.*;
import java.security.*;
import java.nio.charset.StandardCharsets;

@Service
public class AdminSecurityService {
 private final UserRepository users;private final AuthActionTokenRepository tokens;private final RefreshTokenRepository refresh;private final PasswordEncoder encoder;private final MailService mail;private final EntityManager em;
 public AdminSecurityService(UserRepository users,AuthActionTokenRepository tokens,RefreshTokenRepository refresh,PasswordEncoder encoder,MailService mail,EntityManager em){this.users=users;this.tokens=tokens;this.refresh=refresh;this.encoder=encoder;this.mail=mail;this.em=em;}
 public record Invitation(String email,String message,Instant expiresAt){}
 @Transactional public Invitation invite(String email,String name){
  email=email.trim().toLowerCase(Locale.ROOT);if(users.findByEmailIgnoreCase(email).isPresent())throw new IllegalArgumentException("Email already registered");
  User u=new User();u.email=email;u.displayName=name.trim();u.passwordHash=encoder.encode(UUID.randomUUID()+"."+UUID.randomUUID());u.role=Role.ADMIN;u.status="PENDING_INVITATION";u.emailVerified=false;users.save(u);
  String raw=UUID.randomUUID()+"."+UUID.randomUUID();AuthActionToken t=new AuthActionToken();t.userId=u.id;t.type="ADMIN_INVITE";t.tokenHash=hash(raw);t.expiresAt=Instant.now().plus(Duration.ofHours(24));tokens.save(t);
  mail.adminInvitation(email,raw);return new Invitation(email,"Invitation email sent; recipient must set a password within 24 hours",t.expiresAt);
 }
 @Transactional public void accept(String raw,String password){
  AuthActionToken token=tokens.findByHashForUpdate(hash(raw),"ADMIN_INVITE").filter(t->t.usedAt==null&&t.expiresAt.isAfter(Instant.now())).orElseThrow(()->new IllegalArgumentException("Invitation is invalid or expired"));
  User u=users.findByIdForUpdate(token.userId).orElseThrow();if(u.role!=Role.ADMIN||!"PENDING_INVITATION".equals(u.status))throw new IllegalArgumentException("Invitation is not active");
  u.passwordHash=encoder.encode(password);u.emailVerified=true;u.status="ACTIVE";u.tokenVersion++;users.save(u);token.usedAt=Instant.now();tokens.save(token);
 }
 @Transactional public User access(UUID actor,UUID id,String action){
  List<User> admins=users.findAdminsForUpdate();admins.forEach(u->em.refresh(u));
  User acting=admins.stream().filter(u->u.id.equals(actor)&&"ACTIVE".equals(u.status)).findFirst().orElseThrow(()->new IllegalArgumentException("Active admin account required"));
  User target=admins.stream().filter(u->u.id.equals(id)).findFirst().orElseThrow(()->new NoSuchElementException("Admin not found"));
  if(!List.of("suspend","activate").contains(action))throw new IllegalArgumentException("Unsupported admin action");
  if(actor.equals(id)&&"suspend".equals(action))throw new IllegalArgumentException("You cannot suspend your own admin account");
  if("suspend".equals(action)){
   if("ACTIVE".equals(target.status)&&admins.stream().filter(u->"ACTIVE".equals(u.status)).count()<=1)throw new IllegalArgumentException("Cannot suspend the last active admin");
   if("PENDING_INVITATION".equals(target.status))throw new IllegalArgumentException("Pending invitation cannot be activated or suspended");target.status="SUSPENDED";target.tokenVersion++;refresh.findByUserIdAndRevokedAtIsNull(id).forEach(t->t.revokedAt=Instant.now());
  }else{if(!"SUSPENDED".equals(target.status)||!target.emailVerified)throw new IllegalArgumentException("Only suspended, verified admins can be reactivated");target.status="ACTIVE";}
  return users.save(target);
 }
 private static String hash(String raw){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException ex){throw new IllegalStateException(ex);}}
}
