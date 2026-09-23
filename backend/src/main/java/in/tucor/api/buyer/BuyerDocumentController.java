package in.tucor.api.buyer;

import in.tucor.api.auth.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/buyer/documents")
public class BuyerDocumentController {
 private static final long MAX_SIZE=5L*1024*1024;
 private static final Set<String> TYPES=Set.of("GST","PAN","FSSAI_OR_REGISTRATION","ADDRESS_PROOF","BANK_PROOF","DIRECTOR_KYC","END_USE_DECLARATION","POLLUTION_CONTROL","ISO","TRADE_LICENSE");
 private final RegistrationDocumentRepository documents;
 private final Path root;

 public BuyerDocumentController(RegistrationDocumentRepository documents,@Value("${tucor.upload-dir:./uploads/registration}") String directory) throws IOException {
  this.documents=documents;this.root=Paths.get(directory).toAbsolutePath().normalize();Files.createDirectories(root);
 }

 public record Doc(String id,String name,String type,String status,long sizeBytes,String uploadedAt,String expiresAt,String rejectionReason,String verifiedAt){}

 @GetMapping
 public List<Doc> all(Authentication authentication){return documents.findByUserIdOrderByCreatedAtDesc(userId(authentication)).stream().map(this::dto).toList();}

 @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 @Transactional(rollbackFor=Exception.class)
 public Doc upload(Authentication authentication,@RequestParam String documentType,@RequestPart("file") MultipartFile file) throws IOException {
  UUID userId=userId(authentication);String type=documentType.trim().toUpperCase(Locale.ROOT);
  if(!TYPES.contains(type))throw new IllegalArgumentException("Unsupported document type");
  FileKind kind=validate(file);RegistrationDocument document=documents.findByUserIdAndDocumentType(userId,type).orElseGet(RegistrationDocument::new);
  String oldStored=document.storedFilename;String stored=userId+"-"+type+"-"+UUID.randomUUID()+kind.extension;
  Path target=safePath(stored);Path temporary=safePath(".upload-"+UUID.randomUUID()+".tmp");
  try(InputStream input=file.getInputStream()){Files.copy(input,temporary,StandardCopyOption.REPLACE_EXISTING);}
  try{Files.move(temporary,target,StandardCopyOption.ATOMIC_MOVE);}catch(AtomicMoveNotSupportedException e){Files.move(temporary,target,StandardCopyOption.REPLACE_EXISTING);}
  try{
   document.userId=userId;document.documentType=type;document.originalFilename=safeOriginalName(file.getOriginalFilename(),kind.extension);
   document.storedFilename=stored;document.contentType=kind.contentType;document.sizeBytes=file.getSize();document.status="PENDING_REVIEW";
   document.rejectionReason=null;document.verifiedBy=null;document.verifiedAt=null;document.expiresAt=null;
   document=documents.save(document);
  }catch(RuntimeException e){Files.deleteIfExists(target);throw e;}
  if(oldStored!=null&&!oldStored.equals(stored))Files.deleteIfExists(safePath(oldStored));
  return dto(document);
 }

 @GetMapping("/{id}/download")
 public ResponseEntity<Resource> download(Authentication authentication,@PathVariable UUID id) throws IOException {
  UUID userId=userId(authentication);RegistrationDocument document=documents.findById(id).filter(x->x.userId.equals(userId)).orElseThrow(()->new NoSuchElementException("Document not found"));
  Path path=safePath(document.storedFilename);if(!Files.isRegularFile(path))throw new NoSuchElementException("Document file not found");
  Resource resource=new FileSystemResource(path);
  ContentDisposition disposition=ContentDisposition.attachment().filename(safeOriginalName(document.originalFilename,""),StandardCharsets.UTF_8).build();
  return ResponseEntity.ok().contentType(MediaType.parseMediaType(document.contentType)).header(HttpHeaders.CONTENT_DISPOSITION,disposition.toString()).contentLength(document.sizeBytes).body(resource);
 }

 @DeleteMapping("/{id}")
 @ResponseStatus(HttpStatus.NO_CONTENT)
 @Transactional(rollbackFor=Exception.class)
 public void delete(Authentication authentication,@PathVariable UUID id) throws IOException {
  UUID userId=userId(authentication);RegistrationDocument document=documents.findById(id).filter(x->x.userId.equals(userId)).orElseThrow(()->new NoSuchElementException("Document not found"));
  documents.delete(document);Files.deleteIfExists(safePath(document.storedFilename));
 }

 private FileKind validate(MultipartFile file) throws IOException {
  if(file.isEmpty()||file.getSize()>MAX_SIZE)throw new IllegalArgumentException("File must be between 1 byte and 5MB");
  byte[] header;
  try(InputStream input=file.getInputStream()){header=input.readNBytes(8);}
  if(startsWith(header,new byte[]{0x25,0x50,0x44,0x46,0x2D}))return new FileKind("application/pdf",".pdf");
  if(startsWith(header,new byte[]{(byte)0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A}))return new FileKind("image/png",".png");
  if(startsWith(header,new byte[]{(byte)0xFF,(byte)0xD8,(byte)0xFF}))return new FileKind("image/jpeg",".jpg");
  throw new IllegalArgumentException("File content must be PDF, JPEG or PNG");
 }
 private boolean startsWith(byte[] value,byte[] prefix){if(value.length<prefix.length)return false;for(int i=0;i<prefix.length;i++)if(value[i]!=prefix[i])return false;return true;}
 private Path safePath(String stored){Path path=root.resolve(stored).normalize();if(!path.startsWith(root))throw new IllegalArgumentException("Invalid document path");return path;}
 private String safeOriginalName(String name,String fallbackExtension){String cleaned=Optional.ofNullable(name).orElse("document"+fallbackExtension).replace('\r','_').replace('\n','_').replace('"','_');return cleaned.isBlank()?"document"+fallbackExtension:cleaned;}
 private UUID userId(Authentication authentication){return UUID.fromString(authentication.getName());}
 private Doc dto(RegistrationDocument document){return new Doc(document.id.toString(),document.originalFilename,document.documentType,document.status,document.sizeBytes,document.createdAt.toString(),document.expiresAt==null?null:document.expiresAt.toString(),document.rejectionReason,document.verifiedAt==null?null:document.verifiedAt.toString());}
 private record FileKind(String contentType,String extension){}
}
