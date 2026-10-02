package in.tucor.api.admin;
import in.tucor.api.auth.*;
import in.tucor.api.seller.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.*;
@RestController
public class AdminDocumentRequestController {
 private final UserRepository users;private final AdminDocumentRequestRepository requests;private final SellerNotificationRepository notifications;private final AdminAuditLogRepository audit;
 public AdminDocumentRequestController(UserRepository users,AdminDocumentRequestRepository requests,SellerNotificationRepository notifications,AdminAuditLogRepository audit){this.users=users;this.requests=requests;this.notifications=notifications;this.audit=audit;}
 public record Create(@NotBlank @Size(max=2000) String message){}
 public record Change(@NotBlank @Pattern(regexp="complete|cancel") String action){}
 public record Request(UUID id,UUID userId,String message,String status,Instant createdAt,Instant updatedAt){}
 @PostMapping("/api/admin/businesses/{id}/document-requests") @Transactional public Request create(Authentication a,@PathVariable UUID id,@Valid @RequestBody Create r,HttpServletRequest http){User actor=admin(a);User owner=users.findByIdForUpdate(id).filter(u->u.role!=Role.ADMIN).orElseThrow(()->new NoSuchElementException("Business not found"));AdminDocumentRequest request=new AdminDocumentRequest();request.userId=id;request.requestedBy=actor.id;request.message=r.message().trim();request=requests.save(request);if(owner.role==Role.SELLER){SellerNotification n=new SellerNotification();n.sellerId=id;n.type="verification";n.title="Documents requested by TUCOR";n.message=request.message.substring(0,Math.min(1000,request.message.length()));notifications.save(n);}log(actor,request,"Document Request Created",http);return dto(request);}
 @GetMapping("/api/admin/businesses/{id}/document-requests") public List<Request> all(Authentication a,@PathVariable UUID id){admin(a);return requests.findByUserIdOrderByCreatedAtDesc(id).stream().map(this::dto).toList();}
 @PatchMapping("/api/admin/document-requests/{id}") @Transactional public Request change(Authentication a,@PathVariable UUID id,@Valid @RequestBody Change r,HttpServletRequest http){User actor=admin(a);AdminDocumentRequest request=requests.findByIdForUpdate(id).orElseThrow();if(!"Open".equals(request.status))throw new IllegalArgumentException("Request has already been closed");request.status="complete".equals(r.action())?"Completed":"Cancelled";requests.save(request);log(actor,request,"Document Request "+request.status,http);return dto(request);}
 @GetMapping({"/api/buyer/document-requests","/api/seller/document-requests"}) public List<Request> own(Authentication a){return requests.findByUserIdOrderByCreatedAtDesc(UUID.fromString(a.getName())).stream().map(this::dto).toList();}
 private User admin(Authentication a){return users.findById(UUID.fromString(a.getName())).filter(u->u.role==Role.ADMIN&&"ACTIVE".equals(u.status)).orElseThrow(()->new IllegalArgumentException("Active admin required"));}
 private Request dto(AdminDocumentRequest r){return new Request(r.id,r.userId,r.message,r.status,r.createdAt,r.updatedAt);}
 private void log(User actor,AdminDocumentRequest r,String action,HttpServletRequest http){AdminAuditLog l=new AdminAuditLog();l.actorId=actor.id;l.actor=actor.email;l.actorRole="Admin";l.action=action;l.module="Verification";l.target="Document Request";l.targetId=r.id.toString();l.ipAddress=http.getRemoteAddr();l.severity="Info";l.details="Business "+r.userId+"; status "+r.status;audit.save(l);}
}
