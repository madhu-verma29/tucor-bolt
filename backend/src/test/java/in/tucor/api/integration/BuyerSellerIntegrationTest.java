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
class BuyerSellerIntegrationTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper json;
 @Autowired UserRepository users; @Autowired RegistrationProfileRepository profiles;
 @Autowired MarketListingRepository listings; @Autowired BuyerOrderRepository orders;
 @Autowired JwtService jwt; @Autowired PasswordEncoder encoder; @Autowired AuthService auth;
 User buyer,seller,other;
 @BeforeEach void seed(){buyer=user(Role.BUYER);seller=user(Role.SELLER);other=user(Role.SELLER);}
 User user(Role role){User u=new User();u.id=UUID.randomUUID();u.email=u.id+"@example.test";u.passwordHash=encoder.encode("Old-password-123");u.role=role;u.emailVerified=true;u.status="ACTIVE";u=users.saveAndFlush(u);RegistrationProfile p=new RegistrationProfile();p.userId=u.id;p.businessName="Original business";p.businessType="Restaurant";p.gstNumber="29ABCDE1234F1Z5";p.address="Test address";p.city="Bengaluru";p.state="Karnataka";p.pincode="560001";p.fullName="Test owner";p.phone="9876543210";profiles.saveAndFlush(p);return u;}
 String bearer(User u){return "Bearer "+jwt.access(u);}
 String body(Map<String,?> m)throws Exception{return json.writeValueAsString(m);}
 JsonNode response(MvcResult r)throws Exception{return json.readTree(r.getResponse().getContentAsString());}
 MarketListing listing(){MarketListing l=new MarketListing();l.publicId="LST-"+UUID.randomUUID().toString().substring(0,8);l.sellerId=seller.id;l.sellerRef="SEL-test";l.oilType="Palm";l.volumeLiters=100;l.gradeLabel="A";l.pricePerLiter=new BigDecimal("40.00");l.status="Available";l.city="Bengaluru";l.state="Karnataka";l.collectionFrequency="Weekly";l.minOrderLiters=1;l.listingDate=LocalDate.now();return listings.saveAndFlush(l);}
 Map<String,Object> listingRequest(String status){return Map.of("oilType","Palm","grade","A","volumeLiters",100,"pricePerLiter",40,"collectionFrequency","Weekly","pickupDays",List.of("Mon"),"pickupTimeSlot","Flexible","location","Bengaluru, Karnataka","status",status);}
 @Test void rolesAndAnonymousRequestsAreEnforced()throws Exception{
  mvc.perform(get("/api/buyer/profile")).andExpect(status().isUnauthorized());
  mvc.perform(get("/api/buyer/profile").header("Authorization",bearer(seller))).andExpect(status().isForbidden());
  mvc.perform(get("/api/seller/profile").header("Authorization",bearer(buyer))).andExpect(status().isForbidden());
 }
 @Test void bothProfilesPersistAndSellerValidationIsApplied()throws Exception{
  mvc.perform(patch("/api/buyer/profile").header("Authorization",bearer(buyer)).contentType("application/json").content(body(Map.of("businessName","Buyer updated")))).andExpect(status().isOk());
  mvc.perform(get("/api/buyer/profile").header("Authorization",bearer(buyer))).andExpect(jsonPath("$.businessName").value("Buyer updated"));
  mvc.perform(patch("/api/seller/profile").header("Authorization",bearer(seller)).contentType("application/json").content(body(Map.of("businessName","Seller updated")))).andExpect(status().isOk());
  mvc.perform(get("/api/seller/profile").header("Authorization",bearer(seller))).andExpect(jsonPath("$.businessName").value("Seller updated"));
  mvc.perform(patch("/api/seller/profile").header("Authorization",bearer(seller)).contentType("application/json").content(body(Map.of("pan","invalid")))).andExpect(status().isBadRequest());
 }
 @Test void uploadSignatureAndOwnershipAreEnforced()throws Exception{
  MockMultipartFile fake=new MockMultipartFile("file","fake.pdf","application/pdf","not a pdf".getBytes());
  mvc.perform(multipart("/api/seller/documents").file(fake).param("documentType","GST").header("Authorization",bearer(seller))).andExpect(status().isBadRequest());
  MockMultipartFile pdf=new MockMultipartFile("file","safe.pdf","application/pdf","%PDF-1.7 test".getBytes());
  String id=response(mvc.perform(multipart("/api/seller/documents").file(pdf).param("documentType","GST").header("Authorization",bearer(seller))).andExpect(status().isOk()).andReturn()).get("id").asText();
  mvc.perform(get("/api/seller/documents/"+id+"/download").header("Authorization",bearer(other))).andExpect(status().isNotFound());
  mvc.perform(get("/api/seller/documents/"+id+"/download").header("Authorization",bearer(seller))).andExpect(status().isOk());
  mvc.perform(delete("/api/seller/documents/"+id).header("Authorization",bearer(other))).andExpect(status().isNotFound());
 }
 @Test void sellerCannotSelfApproveAndDecisionsRestoreStockOnce()throws Exception{
  mvc.perform(post("/api/seller/listings").header("Authorization",bearer(seller)).contentType("application/json").content(body(listingRequest("Active")))).andExpect(status().isBadRequest());
  MarketListing l=listing();
  String order=response(mvc.perform(post("/api/buyer/orders").header("Authorization",bearer(buyer)).contentType("application/json").content(body(Map.of("listingId",l.publicId,"volumeLiters",60,"deliveryAddress","Test destination")))).andExpect(status().isOk()).andReturn()).get("id").asText();
  mvc.perform(put("/api/seller/listings/"+l.publicId).header("Authorization",bearer(seller)).contentType("application/json").content(body(listingRequest("Draft")))).andExpect(status().isBadRequest());
  mvc.perform(patch("/api/seller/requests/"+order).header("Authorization",bearer(seller)).contentType("application/json").content("{\"action\":\"reject\"}")).andExpect(status().isOk());
  mvc.perform(patch("/api/seller/requests/"+order).header("Authorization",bearer(seller)).contentType("application/json").content("{\"action\":\"reject\"}")).andExpect(status().isBadRequest());
  assertEquals(100,listings.findById(l.id).orElseThrow().volumeLiters);
 }
 @Test void simultaneousOrdersCannotOversell()throws Exception{
  MarketListing l=listing();String token=bearer(buyer);String payload=body(Map.of("listingId",l.publicId,"volumeLiters",60,"deliveryAddress","Test destination"));
  try(ExecutorService pool=Executors.newFixedThreadPool(2)){
   CountDownLatch start=new CountDownLatch(1);Callable<Integer> request=()->{start.await();return mvc.perform(post("/api/buyer/orders").header("Authorization",token).contentType("application/json").content(payload)).andReturn().getResponse().getStatus();};
   Future<Integer> first=pool.submit(request),second=pool.submit(request);start.countDown();List<Integer> statuses=new ArrayList<>(List.of(first.get(20,TimeUnit.SECONDS),second.get(20,TimeUnit.SECONDS)));Collections.sort(statuses);assertEquals(List.of(200,400),statuses);
  }
  assertEquals(40,listings.findById(l.id).orElseThrow().volumeLiters);
 }
 @Test void passwordChangeInvalidatesExistingAccessAndRefreshTokens()throws Exception{
  var tokens=auth.login(new AuthDtos.Login(seller.email,"Old-password-123",true));
  mvc.perform(put("/api/seller/settings/password").header("Authorization","Bearer "+tokens.accessToken()).contentType("application/json").content("{\"currentPassword\":\"Old-password-123\",\"newPassword\":\"New-password-456\"}")).andExpect(status().isNoContent());
  mvc.perform(get("/api/seller/profile").header("Authorization","Bearer "+tokens.accessToken())).andExpect(status().isUnauthorized());
  assertThrows(IllegalArgumentException.class,()->auth.rotate(tokens.refreshToken()));
 }
 @Test void failedLoginAttemptsCommitAndLockAccount(){
  for(int i=0;i<5;i++)assertThrows(IllegalArgumentException.class,()->auth.login(new AuthDtos.Login(buyer.email,"wrong",false)));
  assertTrue(users.findById(buyer.id).orElseThrow().lockedUntil.isAfter(Instant.now()));
 }
 @Test void unverifiedBusinessCannotTradeAndUnsupportedSecurityCannotBeEnabled()throws Exception{
  buyer.status="UNDER_REVIEW";users.saveAndFlush(buyer);MarketListing l=listing();
  mvc.perform(post("/api/buyer/orders").header("Authorization",bearer(buyer)).contentType("application/json").content(body(Map.of("listingId",l.publicId,"volumeLiters",20,"deliveryAddress","Test destination")))).andExpect(status().isBadRequest());
  mvc.perform(put("/api/seller/settings/preferences").header("Authorization",bearer(seller)).contentType("application/json").content("{\"twoFactor\":true}")).andExpect(status().isBadRequest());
 }
 @Test void concurrentPaymentInitiationCreatesOnlyOnePayment()throws Exception{
  MarketListing l=listing();BuyerOrder o=new BuyerOrder();o.publicId="ORD-"+UUID.randomUUID().toString().substring(0,8);o.buyerId=buyer.id;o.listingId=l.id;o.volumeLiters=20;o.pricePerLiter=new BigDecimal("40.00");o.totalAmount=new BigDecimal("1000.00");o.status="Confirmed";o.deliveryAddress="Test destination";orders.saveAndFlush(o);
  String token=bearer(buyer),payload=body(Map.of("orderId",o.publicId,"method","bank"));
  try(ExecutorService pool=Executors.newFixedThreadPool(2)){
   CountDownLatch start=new CountDownLatch(1);Callable<Integer> request=()->{start.await();return mvc.perform(post("/api/buyer/payments").header("Authorization",token).contentType("application/json").content(payload)).andReturn().getResponse().getStatus();};
   Future<Integer> first=pool.submit(request),second=pool.submit(request);start.countDown();List<Integer> statuses=new ArrayList<>(List.of(first.get(20,TimeUnit.SECONDS),second.get(20,TimeUnit.SECONDS)));Collections.sort(statuses);assertEquals(List.of(200,400),statuses);
  }
  assertEquals("Payment Pending",orders.findById(o.id).orElseThrow().status);
 }
 @Test void warehouseMapLinkPersistsIsOwnerScopedAndCanBeRemoved()throws Exception{
  Map<String,Object> contact=new HashMap<>(Map.of("primaryName","Warehouse owner","primaryPhone","9876543210","primaryEmail",buyer.email,"warehouseAddress","Existing warehouse","warehouseMapLink","https://maps.app.goo.gl/ExampleLocation"));
  mvc.perform(put("/api/buyer/settings/contacts").header("Authorization",bearer(buyer)).contentType("application/json").content(body(contact))).andExpect(status().isOk());
  mvc.perform(get("/api/buyer/settings/contacts").header("Authorization",bearer(buyer))).andExpect(jsonPath("$.warehouseMapLink").value("https://maps.app.goo.gl/ExampleLocation")).andExpect(jsonPath("$.warehouseAddress").value("Existing warehouse"));
  User anotherBuyer=user(Role.BUYER);
  mvc.perform(get("/api/buyer/settings/contacts").header("Authorization",bearer(anotherBuyer))).andExpect(jsonPath("$.warehouseMapLink").isEmpty());
  contact.remove("warehouseMapLink");
  mvc.perform(put("/api/buyer/settings/contacts").header("Authorization",bearer(buyer)).contentType("application/json").content(body(contact))).andExpect(jsonPath("$.warehouseMapLink").value("https://maps.app.goo.gl/ExampleLocation"));
  for(String unsafe:List.of("javascript:alert(1)","https://","https://user:password@maps.example.test/location")){
   contact.put("warehouseMapLink",unsafe);
   mvc.perform(put("/api/buyer/settings/contacts").header("Authorization",bearer(buyer)).contentType("application/json").content(body(contact))).andExpect(status().isBadRequest());
  }
  mvc.perform(get("/api/buyer/settings/contacts").header("Authorization",bearer(buyer))).andExpect(jsonPath("$.warehouseMapLink").value("https://maps.app.goo.gl/ExampleLocation"));
  contact.put("warehouseMapLink","");
  mvc.perform(put("/api/buyer/settings/contacts").header("Authorization",bearer(buyer)).contentType("application/json").content(body(contact))).andExpect(jsonPath("$.warehouseMapLink").isEmpty());
 }
 @Test void unverifiedRegistrationTokenCannotAccessOperationalEndpoints()throws Exception{
  seller.emailVerified=false;seller.status="PENDING_VERIFICATION";users.saveAndFlush(seller);
  mvc.perform(get("/api/seller/profile").header("Authorization",bearer(seller))).andExpect(status().isUnauthorized());
  MockMultipartFile pdf=new MockMultipartFile("file","fssai.pdf","application/pdf","%PDF-1.7 test".getBytes());
  mvc.perform(multipart("/api/auth/registration-documents").file(pdf).param("documentType","FSSAI_OR_REGISTRATION").header("Authorization",bearer(seller))).andExpect(status().isCreated()).andExpect(jsonPath("$.documentType").value("FSSAI"));
 }
}
