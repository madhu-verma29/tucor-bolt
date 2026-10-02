package in.tucor.api.admin;
import in.tucor.api.auth.*;
import in.tucor.api.buyer.*;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/admin/search")
public class AdminSearchController {
 private final UserRepository users;private final RegistrationProfileRepository profiles;private final BuyerOrderRepository orders;private final AdminDisputeRepository disputes;
 public AdminSearchController(UserRepository users,RegistrationProfileRepository profiles,BuyerOrderRepository orders,AdminDisputeRepository disputes){this.users=users;this.profiles=profiles;this.orders=orders;this.disputes=disputes;}
 public record Result(String id,String title,String subtitle,String section){}
 @GetMapping public List<Result> search(@RequestParam @Size(min=2,max=80) String q){q=q.trim();if(q.length()<2||q.length()>80)throw new IllegalArgumentException("Search requires at least two characters");var page=PageRequest.of(0,10);Map<UUID,User> found=new LinkedHashMap<>();users.findByRoleNotAndEmailContainingIgnoreCase(Role.ADMIN,q,page).forEach(u->found.put(u.id,u));var matches=profiles.findByBusinessNameContainingIgnoreCaseOrFullNameContainingIgnoreCase(q,q,page);users.findAllById(matches.stream().map(p->p.userId).toList()).stream().filter(u->u.role!=Role.ADMIN).forEach(u->found.put(u.id,u));List<Result> result=new ArrayList<>();found.values().stream().limit(10).forEach(u->result.add(new Result(u.id.toString(),u.email,u.role.name()+" · "+u.status,"users")));orders.findByPublicIdContainingIgnoreCase(q,page).forEach(o->result.add(new Result(o.publicId,o.publicId,o.status,"orders")));disputes.findByPublicIdContainingIgnoreCase(q,page).forEach(d->result.add(new Result(d.publicId,d.publicId,d.status,"disputes")));return result;
 }
}
