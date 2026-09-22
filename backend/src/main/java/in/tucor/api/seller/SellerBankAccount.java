package in.tucor.api.seller;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="seller_bank_accounts")
public class SellerBankAccount {
    @Id @Column(name="user_id") public UUID userId;
    @Column(name="account_holder",nullable=false) public String accountHolder;
    @Column(name="account_number",nullable=false) public String accountNumber;
    @Column(name="bank_name",nullable=false) public String bankName;
    public String branch;
    @Column(nullable=false) public String ifsc;
    @Column(name="account_type",nullable=false) public String accountType;
    @Column(name="upi_id") public String upiId;
    @Column(nullable=false) public boolean verified;
    @Column(name="verified_at") public Instant verifiedAt;
    @Column(name="updated_at",nullable=false) public Instant updatedAt;
    @PrePersist @PreUpdate void touch(){updatedAt=Instant.now();}
}
