package in.tucor.api.buyer;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/buyer/bank-accounts")
public class BuyerAccountController {
 private final BuyerBankAccountRepository accounts;
 public BuyerAccountController(BuyerBankAccountRepository accounts){this.accounts=accounts;}

 public record Account(String id,String bankName,String accountType,String accountHolderName,String accountNumber,String ifsc,String branch,boolean verified,boolean primary){}
 public record Create(@NotBlank @Size(max=120) String bankName,
                      @NotBlank @Pattern(regexp="(?i)^(current|savings)( account)?$",message="must be Current or Savings") String accountType,
                      @NotBlank @Size(max=180) String accountHolderName,
                      @NotBlank @Pattern(regexp="^[0-9]{6,20}$",message="must contain 6 to 20 digits") String accountNumber,
                      @NotBlank @Pattern(regexp="^[A-Za-z]{4}0[A-Za-z0-9]{6}$",message="must be a valid IFSC code") String ifsc,
                      @Size(max=180) String branch){}

 @GetMapping
 public List<Account> all(Authentication authentication){return accounts.findByBuyerIdOrderByCreatedAtAsc(buyerId(authentication)).stream().map(this::dto).toList();}

 @PostMapping
 @Transactional
 public Account add(Authentication authentication,@Valid @RequestBody Create request){
  UUID buyerId=buyerId(authentication);String number=request.accountNumber().trim();
  if(accounts.existsByBuyerIdAndAccountNumber(buyerId,number))throw new IllegalArgumentException("This bank account is already linked");
  BuyerBankAccount account=new BuyerBankAccount();account.buyerId=buyerId;account.bankName=request.bankName().trim();
  account.accountType=normalizeAccountType(request.accountType());account.accountHolderName=request.accountHolderName().trim();
  account.accountNumber=number;account.ifsc=request.ifsc().trim().toUpperCase(Locale.ROOT);
  account.branch=request.branch()==null?null:request.branch().trim();account.verified=false;
  account.primary=accounts.findByBuyerIdOrderByCreatedAtAsc(buyerId).isEmpty();
  return dto(accounts.save(account));
 }

 @DeleteMapping("/{id}")
 @Transactional
 public void delete(Authentication authentication,@PathVariable UUID id){
  UUID buyerId=buyerId(authentication);BuyerBankAccount account=accounts.findByIdAndBuyerId(id,buyerId).orElseThrow(()->new NoSuchElementException("Bank account not found"));
  boolean wasPrimary=account.primary;accounts.delete(account);accounts.flush();
  if(wasPrimary){accounts.findByBuyerIdOrderByCreatedAtAsc(buyerId).stream().findFirst().ifPresent(next->{next.primary=true;accounts.save(next);});}
 }

 @PutMapping("/{id}/primary")
 @Transactional
 public Account primary(Authentication authentication,@PathVariable UUID id){
  UUID buyerId=buyerId(authentication);accounts.findByIdAndBuyerId(id,buyerId).orElseThrow(()->new NoSuchElementException("Bank account not found"));
  accounts.clearPrimary(buyerId);BuyerBankAccount target=accounts.findByIdAndBuyerId(id,buyerId).orElseThrow();target.primary=true;return dto(accounts.save(target));
 }

 private UUID buyerId(Authentication authentication){return UUID.fromString(authentication.getName());}
 private String normalizeAccountType(String value){String v=value.trim().toLowerCase(Locale.ROOT);return v.startsWith("current")?"Current Account":"Savings Account";}
 private Account dto(BuyerBankAccount account){String number=account.accountNumber;String lastFour=number.substring(Math.max(0,number.length()-4));return new Account(account.id.toString(),account.bankName,account.accountType,account.accountHolderName,"•••• •••• "+lastFour,account.ifsc,account.branch,account.verified,account.primary);}
}
