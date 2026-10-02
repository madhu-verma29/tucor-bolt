package in.tucor.api.admin;

import in.tucor.api.auth.*;
import in.tucor.api.buyer.*;
import in.tucor.api.seller.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
public class AdminWorkflowService {
 private final UserRepository users;private final MarketListingRepository listings;private final BuyerOrderRepository orders;private final BuyerPickupRepository pickups;private final BuyerPaymentRepository payments;private final AdminDisputeRepository disputes;private final SellerNotificationRepository notifications;
 public AdminWorkflowService(UserRepository users,MarketListingRepository listings,BuyerOrderRepository orders,BuyerPickupRepository pickups,BuyerPaymentRepository payments,AdminDisputeRepository disputes,SellerNotificationRepository notifications){this.users=users;this.listings=listings;this.orders=orders;this.pickups=pickups;this.payments=payments;this.disputes=disputes;this.notifications=notifications;}
 private record Locked(MarketListing listing,BuyerOrder order){}
 private Locked lock(String id){BuyerOrder snapshot=orders.findByPublicId(id).orElseThrow(()->new NoSuchElementException("Order not found"));MarketListing listing=listings.findById(snapshot.listingId).orElseThrow();listing=listings.findByPublicIdForUpdate(listing.publicId).orElseThrow();return new Locked(listing,orders.findByPublicIdForUpdate(id).orElseThrow());}
 private Locked lock(UUID id){return lock(orders.findById(id).orElseThrow().publicId);}
 @Transactional public MarketListing listing(String id,String action){
  MarketListing l=listings.findByPublicIdForUpdate(id).orElseThrow();
  if("approve".equals(action)){
   User seller=users.findById(l.sellerId).orElseThrow();if(!"ACTIVE".equals(seller.status)||!seller.emailVerified)throw new IllegalArgumentException("Seller business and email must be verified first");
   if(!List.of("Pending Verification","Flagged").contains(l.status))throw new IllegalArgumentException("Only submitted or flagged listings can be approved");
   if(l.volumeLiters<=0||l.availableTo!=null&&l.availableTo.isBefore(LocalDate.now()))throw new IllegalArgumentException("Listing has no available inventory or is expired");
   l.status=l.volumeLiters<l.minOrderLiters?"Limited":"Available";
  }else if(List.of("flag","reject","expire").contains(action)){
   if(List.of("Draft","Completed","Rejected","Expired").contains(l.status))throw new IllegalArgumentException("Listing cannot transition from "+l.status);
   l.status=switch(action){case "flag"->"Flagged";case "reject"->"Rejected";default->"Expired";};
  }else throw new IllegalArgumentException("Unsupported listing action");
  return listings.save(l);
 }
 @Transactional public BuyerOrder order(String id,String action,String reason){
  Locked locked=lock(id);BuyerOrder o=locked.order();MarketListing l=locked.listing();
  switch(action){
   case "confirm"->{if(!List.of("Requested","Under Review","Matched").contains(o.status))throw new IllegalArgumentException("Order is not awaiting confirmation");o.status="Confirmed";}
   case "cancel","reject"->{
    if(!List.of("Requested","Under Review","Matched","Confirmed").contains(o.status))throw new IllegalArgumentException("Only pre-pickup, unpaid orders can be cancelled or rejected");
    if(payments.existsByBuyerIdAndOrderIdAndStatusIn(o.buyerId,o.id,List.of("Pending","Processing","Settled","Disputed")))throw new IllegalArgumentException("Resolve payment before cancelling the order");
    if(pickups.findByOrderId(o.id).isPresent())throw new IllegalArgumentException("Order already has a pickup; logistics cancellation is required");
    o.status="cancel".equals(action)?"Cancelled":"Rejected";l.volumeLiters+=o.volumeLiters;
    if(List.of("Available","Limited","Reserved").contains(l.status))l.status=l.volumeLiters<l.minOrderLiters?"Limited":"Available";listings.save(l);
   }
   default->throw new IllegalArgumentException("Unsupported order action");
  }
  if(reason!=null&&!reason.isBlank())o.notes=(o.notes==null?"":o.notes+"\n")+"TUCOR: "+reason;
  notify(l.sellerId,"order","Order "+o.status.toLowerCase(),o.publicId+" is now "+o.status+".");return orders.save(o);
 }
 @Transactional public BuyerPickup schedule(String orderId,LocalDate date,String agent,String vehicle){
  Locked locked=lock(orderId);BuyerOrder o=locked.order();
  if(!"Confirmed".equals(o.status))throw new IllegalArgumentException("Only confirmed orders can have a pickup scheduled");
  if(pickups.findByOrderId(o.id).isPresent())throw new IllegalArgumentException("A pickup already exists for this order");
  if(date==null||date.isBefore(LocalDate.now()))throw new IllegalArgumentException("Scheduled date must be today or later");
  if((agent==null||agent.isBlank())!=(vehicle==null||vehicle.isBlank()))throw new IllegalArgumentException("Agent and vehicle must be supplied together");
  BuyerPickup p=new BuyerPickup();p.orderId=o.id;p.buyerId=o.buyerId;p.scheduledDate=date;p.agentName=agent;p.vehicleNumber=vehicle;p.status=agent==null||agent.isBlank()?"Scheduled":"Assigned";
  o.status="Pickup Scheduled";o.pickupDate=date;orders.save(o);p=pickups.save(p);notify(locked.listing().sellerId,"pickup","Pickup scheduled",o.publicId+" pickup is scheduled for "+date+".");return p;
 }
 @Transactional public BuyerPickup pickup(String id,String action,LocalDate date,String agent,String vehicle){
  BuyerPickup snapshot=pickups.findByPublicId(id).orElseThrow();Locked locked=lock(snapshot.orderId);BuyerPickup p=pickups.findByPublicIdForUpdate(id).orElseThrow();BuyerOrder o=locked.order();
  if(!List.of("Pickup Scheduled","Picked Up").contains(o.status))throw new IllegalArgumentException("Order is not in the pickup workflow");
  if("assign".equals(action)){
   if(!List.of("Pending","Scheduled","Assigned").contains(p.status))throw new IllegalArgumentException("Pickup cannot be assigned from "+p.status);
   if(agent==null||agent.isBlank()||vehicle==null||vehicle.isBlank())throw new IllegalArgumentException("Real agent name and vehicle number are required");
   LocalDate scheduled=date==null?p.scheduledDate:date;if(scheduled==null||scheduled.isBefore(LocalDate.now()))throw new IllegalArgumentException("Scheduled date must be today or later");
   p.agentName=agent.trim();p.vehicleNumber=vehicle.trim();p.scheduledDate=scheduled;p.status="Assigned";o.pickupDate=scheduled;
  }else if("complete".equals(action)){
   if(!List.of("Assigned","In Transit","Picked Up").contains(p.status))throw new IllegalArgumentException("Only assigned or in-transit pickups can be completed");
   if(p.scheduledDate!=null&&p.scheduledDate.isAfter(LocalDate.now()))throw new IllegalArgumentException("Cannot complete a pickup before its scheduled date");
   p.status="Completed";p.volumeConfirmed=o.volumeLiters;o.status="Delivered";o.deliveryDate=LocalDate.now();
  }else throw new IllegalArgumentException("Unsupported pickup action");
  orders.save(o);notify(locked.listing().sellerId,"pickup","Pickup "+p.status.toLowerCase(),p.publicId+" is now "+p.status+".");return pickups.save(p);
 }
 @Transactional public BuyerPayment payment(String id,String action){
  BuyerPayment snapshot=payments.findByPublicId(id).orElseThrow();Locked locked=lock(snapshot.orderId);BuyerPayment p=payments.findByPublicIdForUpdate(id).orElseThrow();BuyerOrder o=locked.order();
  if("settle".equals(action)||"resolve".equals(action))throw new IllegalArgumentException("Settlement requires verified payment-provider evidence; the admin console cannot mark funds settled");
  if("process".equals(action)){if(!"Pending".equals(p.status)||!"Payment Pending".equals(o.status))throw new IllegalArgumentException("Only pending payments can enter processing");p.status="Processing";}
  else if("fail".equals(action)){if(!List.of("Pending","Processing").contains(p.status)||!"Payment Pending".equals(o.status))throw new IllegalArgumentException("Only unsettled active attempts can fail");p.status="Failed";o.status=List.of("Confirmed","Delivered","Payment").contains(Objects.toString(o.paymentPreviousStatus,""))?o.paymentPreviousStatus:"Payment";orders.save(o);}
  else throw new IllegalArgumentException("Unsupported payment action");
  notify(locked.listing().sellerId,"payment","Payment "+p.status.toLowerCase(),p.publicId+" is now "+p.status+".");return payments.save(p);
 }
 @Transactional public AdminDispute openDispute(String id,String reason,String description){
  Locked locked=lock(id);BuyerOrder o=locked.order();if(disputes.findByOrderId(o.id).isPresent())throw new IllegalArgumentException("A dispute already exists for this order");
  if(List.of("Cancelled","Rejected","Disputed").contains(o.status))throw new IllegalArgumentException("Order cannot be disputed from "+o.status);
  AdminDispute d=new AdminDispute();d.orderId=o.id;d.previousOrderStatus=o.status;d.raisedBy="TUCOR Administration";d.raisedByRole="Admin";d.againstParty="Order participants";d.reason=reason;d.description=description;d.status="Open";d.priority="High";d.amount=o.totalAmount;o.status="Disputed";orders.save(o);return disputes.save(d);
 }
 @Transactional public AdminDispute dispute(String id,String action,String reason){
  AdminDispute snapshot=disputes.findByPublicId(id).orElseThrow();Locked locked=lock(snapshot.orderId);AdminDispute d=disputes.findByPublicIdForUpdate(id).orElseThrow();
  if(List.of("Resolved","Closed").contains(d.status)&&!"close".equals(action))throw new IllegalArgumentException("Dispute is already resolved or closed");
  switch(action){
   case "resolve"->{if(reason==null||reason.isBlank())throw new IllegalArgumentException("Resolution details are required");d.status="Resolved";d.resolution=reason;BuyerOrder o=locked.order();if("Disputed".equals(o.status)&&d.previousOrderStatus!=null){o.status=d.previousOrderStatus;orders.save(o);}}
   case "investigate"->{if(!List.of("Open","Escalated").contains(d.status))throw new IllegalArgumentException("Dispute is not awaiting investigation");d.status="Under Investigation";}
   case "escalate"->{if(!List.of("Open","Under Investigation").contains(d.status))throw new IllegalArgumentException("Dispute cannot be escalated");d.status="Escalated";}
   case "close"->{if(!"Resolved".equals(d.status))throw new IllegalArgumentException("Resolve the dispute before closing it");d.status="Closed";}
   default->throw new IllegalArgumentException("Unsupported dispute action");
  }
  return disputes.save(d);
 }
 private void notify(UUID seller,String type,String title,String message){SellerNotification n=new SellerNotification();n.sellerId=seller;n.type=type;n.title=title;n.message=message;notifications.save(n);}
}
