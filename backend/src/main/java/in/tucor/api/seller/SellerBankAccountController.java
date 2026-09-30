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
    public record Update(@NotBlank @Size(max=255) String accountHolder,@NotBlank @Size(max=34) String accountNumber,@NotBlank @Size(max=160) String bankName,@Size(max=255) String branch,@NotBlank @Pattern(regexp="^[A-Z]{4}0[A-Z0-9]{6}$") String ifsc,@NotBlank @Pattern(regexp="Savings|Current|SAVINGS|CURRENT") String accountType,@Size(max=160) String upiId){}
    @GetMapping public Account get(Authentication a){UUID id=seller(a);return accounts.findById(id).map(this::dto).orElse(new Account("","","","","","","",false,null));}
    @PutMapping @Transactional public Account update(Authentication a,@Valid @RequestBody Update r){UUID id=seller(a);users.findByIdForUpdate(id).orElseThrow();SellerBankAccount x=accounts.findById(id).orElseGet(SellerBankAccount::new);String number=r.accountNumber().trim();if(x.userId!=null&&number.equals(mask(x.accountNumber)))number=x.accountNumber;if(!number.matches("^[0-9]{9,34}$"))throw new IllegalArgumentException("Account number must contain 9 to 34 digits");boolean changed=x.userId==null||!number.equals(x.accountNumber)||!r.ifsc().equalsIgnoreCase(x.ifsc)||!r.accountHolder().trim().equals(x.accountHolder)||!r.accountType().equalsIgnoreCase(x.accountType);x.userId=id;x.accountHolder=r.accountHolder().trim();x.accountNumber=number;x.bankName=r.bankName().trim();x.branch=clean(r.branch());x.ifsc=r.ifsc().trim().toUpperCase();x.accountType=r.accountType().trim();x.upiId=clean(r.upiId());if(changed){x.verified=false;x.verifiedAt=null;}return dto(accounts.save(x));}
    private UUID seller(Authentication a){UUID id=UUID.fromString(a.getName());User u=users.findById(id).orElseThrow();if(u.role!=Role.SELLER)throw new IllegalArgumentException("Seller account required");return id;}
    private String clean(String s){return s==null||s.isBlank()?null:s.trim();}
    private String mask(String number){return number==null?"":"*".repeat(Math.max(0,number.length()-4))+number.substring(Math.max(0,number.length()-4));}
    private Account dto(SellerBankAccount x){return new Account(x.accountHolder,mask(x.accountNumber),x.bankName,x.branch,x.ifsc,x.accountType,x.upiId,x.verified,x.verifiedAt==null?null:x.verifiedAt.toString());}
}
