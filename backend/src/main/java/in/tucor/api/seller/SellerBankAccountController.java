package in.tucor.api.seller;

import in.tucor.api.auth.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/api/seller/bank-account")
public class SellerBankAccountController {
    private final SellerBankAccountRepository accounts; private final UserRepository users;
    public SellerBankAccountController(SellerBankAccountRepository accounts,UserRepository users){this.accounts=accounts;this.users=users;}
    public record Account(String accountHolder,String accountNumber,String bankName,String branch,String ifsc,String accountType,String upiId,boolean verified,String verifiedAt){}
    public record Update(@NotBlank String accountHolder,@NotBlank String accountNumber,@NotBlank String bankName,String branch,@NotBlank @Pattern(regexp="^[A-Z]{4}0[A-Z0-9]{6}$") String ifsc,@NotBlank String accountType,String upiId){}
    @GetMapping public Account get(Authentication a){UUID id=seller(a);return accounts.findById(id).map(this::dto).orElse(new Account("","","","","","","",false,null));}
    @PutMapping @Transactional public Account update(Authentication a,@Valid @RequestBody Update r){UUID id=seller(a);SellerBankAccount x=accounts.findById(id).orElseGet(SellerBankAccount::new);boolean changed=x.userId!=null&&(!r.accountNumber().equals(x.accountNumber)||!r.ifsc().equalsIgnoreCase(x.ifsc));x.userId=id;x.accountHolder=r.accountHolder().trim();x.accountNumber=r.accountNumber().trim();x.bankName=r.bankName().trim();x.branch=clean(r.branch());x.ifsc=r.ifsc().trim().toUpperCase();x.accountType=r.accountType().trim();x.upiId=clean(r.upiId());if(changed){x.verified=false;x.verifiedAt=null;}return dto(accounts.save(x));}
    private UUID seller(Authentication a){UUID id=UUID.fromString(a.getName());User u=users.findById(id).orElseThrow();if(u.role!=Role.SELLER)throw new IllegalArgumentException("Seller account required");return id;}
    private String clean(String s){return s==null||s.isBlank()?null:s.trim();}
    private Account dto(SellerBankAccount x){return new Account(x.accountHolder,x.accountNumber,x.bankName,x.branch,x.ifsc,x.accountType,x.upiId,x.verified,x.verifiedAt==null?null:x.verifiedAt.toString());}
}
