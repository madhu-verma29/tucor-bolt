package in.tucor.api.integration;

import com.fasterxml.jackson.databind.*;
import in.tucor.api.auth.*;
import in.tucor.api.buyer.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.*;
import org.springframework.mock.web.MockMultipartFile;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Uses an isolated PostgreSQL database with all Flyway migrations and Hibernate validation. */
@SpringBootTest @AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named="TUCOR_INTEGRATION",matches="true")
class AdminIntegrationTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper json;
 @Autowired UserRepository users; @Autowired RegistrationProfileRepository profiles;
 @Autowired MarketListingRepository listings; @Autowired BuyerOrderRepository orders;
 @Autowired JwtService jwt; @Autowired PasswordEncoder encoder; @Autowired AuthService auth;
 @org.springframework.boot.test.mock.mockito.MockBean MailService mail;
 User buyer,seller,other,admin;
 @BeforeEach void seed(){buyer=user(Role.BUYER);seller=user(Role.SELLER);other=user(Role.SELLER);admin=user(Role.ADMIN);}
 User user(Role role){User u=new User();u.id=UUID.randomUUID();u.email=u.id+"@example.test";u.passwordHash=encoder.encode("Old-password-123");u.role=role;u.emailVerified=true;u.status="ACTIVE";u=users.saveAndFlush(u);RegistrationProfile p=new RegistrationProfile();p.userId=u.id;p.businessName="Original business";p.businessType="Restaurant";p.gstNumber="29ABCDE1234F1Z5";p.address="Test address";p.city="Bengaluru";p.state="Karnataka";p.pincode="560001";p.fullName="Test owner";p.phone="9876543210";profiles.saveAndFlush(p);return u;}
 String bearer(User u){return "Bearer "+jwt.access(u);}
 String body(Map<String,?> m)throws Exception{return json.writeValueAsString(m);}
 JsonNode response(MvcResult r)throws Exception{return json.readTree(r.getResponse().getContentAsString());}
 MarketListing listing(){MarketListing l=new MarketListing();l.publicId="LST-"+UUID.randomUUID().toString().substring(0,8);l.sellerId=seller.id;l.sellerRef="SEL-test";l.oilType="Palm";l.volumeLiters=100;l.gradeLabel="A";l.pricePerLiter=new BigDecimal("40.00");l.status="Available";l.city="Bengaluru";l.state="Karnataka";l.collectionFrequency="Weekly";l.minOrderLiters=1;l.listingDate=LocalDate.now();return listings.saveAndFlush(l);}

 @Test void adminRoleAndSearchValidation()throws Exception{
 mvc.perform(get("/api/admin/search").param("q","example")).andExpect(status().isUnauthorized());
 mvc.perform(get("/api/admin/search").param("q","example").header("Authorization",bearer(buyer))).andExpect(status().isForbidden());
 mvc.perform(get("/api/admin/search").param("q","x").header("Authorization",bearer(admin))).andExpect(status().isBadRequest());
 JsonNode result=response(mvc.perform(get("/api/admin/search").param("q","example").header("Authorization",bearer(admin))).andExpect(status().isOk()).andReturn());assertTrue(result.size()<=30);
 }
 @Test void approvalCannotBypassEmail()throws Exception{
 seller.emailVerified=false;seller.status="PENDING_VERIFICATION";users.saveAndFlush(seller);MarketListing l=listing();l.status="Pending Verification";listings.saveAndFlush(l);
 mvc.perform(patch("/api/admin/businesses/"+seller.id).header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("action","approve")))).andExpect(status().isBadRequest());assertFalse(users.findById(seller.id).orElseThrow().emailVerified);assertEquals("Pending Verification",listings.findById(l.id).orElseThrow().status);
 }
 @Test void requestsAreOwnerScoped()throws Exception{
 mvc.perform(post("/api/admin/businesses/"+seller.id+"/document-requests").header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("message","Replace expired GST certificate")))).andExpect(status().isOk());
 mvc.perform(get("/api/seller/document-requests").header("Authorization",bearer(seller))).andExpect(jsonPath("$[0].message").value("Replace expired GST certificate"));
 mvc.perform(get("/api/seller/document-requests").header("Authorization",bearer(other))).andExpect(jsonPath("$.length()").value(0));
 }
 @Test void secureInvitationsAreSingleUse()throws Exception{
 String email=UUID.randomUUID()+"@example.test";
 JsonNode invited=response(mvc.perform(post("/api/admin/admins/invite").header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("email",email,"name","Invited admin","role","ADMIN")))).andExpect(status().isOk()).andReturn());assertFalse(invited.has("temporaryPassword"));
 User pending=users.findByEmailIgnoreCase(email).orElseThrow();pending.emailVerified=true;pending.passwordHash=encoder.encode("Temp-password-123");users.saveAndFlush(pending);mvc.perform(get("/api/admin/search").param("q","example").header("Authorization",bearer(pending))).andExpect(status().isUnauthorized());mvc.perform(post("/api/auth/login").contentType("application/json").content(body(Map.of("email",email,"password","Temp-password-123","rememberMe",false)))).andExpect(status().isBadRequest());
 var token=org.mockito.ArgumentCaptor.forClass(String.class);org.mockito.Mockito.verify(mail).adminInvitation(org.mockito.ArgumentMatchers.eq(email),token.capture());
 mvc.perform(post("/api/auth/admin-invitations/accept").contentType("application/json").content(body(Map.of("token",token.getValue(),"password","New-password-123")))).andExpect(status().isOk());assertEquals("ACTIVE",users.findByEmailIgnoreCase(email).orElseThrow().status);
 mvc.perform(post("/api/auth/admin-invitations/accept").contentType("application/json").content(body(Map.of("token",token.getValue(),"password","Another-password-123")))).andExpect(status().isBadRequest());
 }
 @Test void selfSuspensionIsRejected()throws Exception{
 mvc.perform(patch("/api/admin/admins/"+admin.id).header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("action","suspend")))).andExpect(status().isBadRequest());assertEquals("ACTIVE",users.findById(admin.id).orElseThrow().status);
 }
 @Test void pickupAndPrivateAlertReceiptsPersist()throws Exception{
 MarketListing l=listing();BuyerOrder o=new BuyerOrder();o.publicId="ORD-"+UUID.randomUUID().toString().substring(0,8);o.buyerId=buyer.id;o.listingId=l.id;o.volumeLiters=20;o.pricePerLiter=l.pricePerLiter;o.totalAmount=new BigDecimal("800");o.status="Confirmed";o.deliveryAddress="Test delivery address";o=orders.saveAndFlush(o);
 String url="/api/admin/orders/"+o.publicId+"/pickup";
 JsonNode p=response(mvc.perform(post(url).header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("scheduledDate",LocalDate.now().toString())))).andExpect(status().isOk()).andReturn());assertEquals("Scheduled",p.get("status").asText());
 mvc.perform(post(url).header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("scheduledDate",LocalDate.now().toString())))).andExpect(status().isBadRequest());
 mvc.perform(patch("/api/admin/pickups/"+p.get("id").asText()).header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("action","complete")))).andExpect(status().isBadRequest());
 mvc.perform(patch("/api/admin/pickups/"+p.get("id").asText()).header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("action","assign","agentName","Test agent","vehicleNumber","KA01AB1234")))).andExpect(status().isOk());
 mvc.perform(patch("/api/admin/pickups/"+p.get("id").asText()).header("Authorization",bearer(admin)).contentType("application/json").content(body(Map.of("action","complete")))).andExpect(status().isOk());assertEquals("Delivered",orders.findById(o.id).orElseThrow().status);
 seller.status="PENDING_VERIFICATION";users.saveAndFlush(seller);
 mvc.perform(put("/api/admin/notifications/pending-users/read").header("Authorization",bearer(admin))).andExpect(status().isNoContent());
 JsonNode alerts=response(mvc.perform(get("/api/admin/notifications").header("Authorization",bearer(admin))).andExpect(status().isOk()).andReturn());for(JsonNode alert:alerts)if(alert.get("id").asText().equals("pending-users"))assertFalse(alert.get("unread").asBoolean());
 User second=user(Role.ADMIN);JsonNode otherAlerts=response(mvc.perform(get("/api/admin/notifications").header("Authorization",bearer(second))).andExpect(status().isOk()).andReturn());for(JsonNode alert:otherAlerts)if(alert.get("id").asText().equals("pending-users"))assertTrue(alert.get("unread").asBoolean());
 }

}
