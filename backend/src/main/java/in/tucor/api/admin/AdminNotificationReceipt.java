package in.tucor.api.admin;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name="admin_notification_receipts")
public class AdminNotificationReceipt {@Id public UUID id;@Column(name="admin_id",nullable=false) public UUID adminId;@Column(name="alert_id",nullable=false) public String alertId;@Column(nullable=false,length=1000) public String message;@PrePersist void create(){if(id==null)id=UUID.randomUUID();}}
