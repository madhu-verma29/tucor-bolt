package in.tucor.api.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth/registration-documents")
public class RegistrationDocumentController {
 private static final long MAX_SIZE=5L*1024*1024;
 private static final Set<String> TYPES=Set.of("GST","FSSAI_OR_REGISTRATION","ADDRESS_PROOF","BANK_PROOF");
 private final UserRepository users;
 private final RegistrationDocumentRepository documents;
 private final Path root;

 public RegistrationDocumentController(UserRepository users,RegistrationDocumentRepository documents,@Value("${tucor.upload-dir:./uploads/registration}") String directory) throws IOException {
  this.users=users;this.documents=documents;this.root=Paths.get(directory).toAbsolutePath().normalize();Files.createDirectories(root);
 }

 @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 @Transactional(rollbackFor=Exception.class)
 public ResponseEntity<Map<String,Object>> upload(Authentication authentication,@RequestParam String documentType,@RequestPart("file") MultipartFile file) throws IOException {
  UUID userId=UUID.fromString(authentication.getName());users.findById(userId).orElseThrow(()->new IllegalArgumentException("Registration account not found"));
  String type=documentType.trim().toUpperCase(Locale.ROOT);if(!TYPES.contains(type))throw new IllegalArgumentException("Unsupported document type");
  FileKind kind=validate(file);RegistrationDocument document=documents.findByUserIdAndDocumentType(userId,type).orElseGet(RegistrationDocument::new);
  String oldStored=document.storedFilename;String stored=userId+"-"+type+"-"+UUID.randomUUID()+kind.extension;Path target=safePath(stored);
  file.transferTo(target);
  try{
   document.userId=userId;document.documentType=type;document.originalFilename=safeName(file.getOriginalFilename(),kind.extension);
   document.storedFilename=stored;document.contentType=kind.contentType;document.sizeBytes=file.getSize();document.status="PENDING_REVIEW";
   document.rejectionReason=null;document.verifiedBy=null;document.verifiedAt=null;document.expiresAt=null;documents.save(document);
  }catch(RuntimeException e){Files.deleteIfExists(target);throw e;}
  if(oldStored!=null&&!oldStored.equals(stored))Files.deleteIfExists(safePath(oldStored));
  return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id",document.id,"documentType",document.documentType,"fileName",document.originalFilename,"status",document.status));
 }

 private FileKind validate(MultipartFile file) throws IOException {
  if(file.isEmpty()||file.getSize()>MAX_SIZE)throw new IllegalArgumentException("File must be between 1 byte and 5MB");
  byte[] header;try(InputStream input=file.getInputStream()){header=input.readNBytes(8);}
  if(startsWith(header,new byte[]{0x25,0x50,0x44,0x46,0x2D}))return new FileKind("application/pdf",".pdf");
  if(startsWith(header,new byte[]{(byte)0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A}))return new FileKind("image/png",".png");
  if(startsWith(header,new byte[]{(byte)0xFF,(byte)0xD8,(byte)0xFF}))return new FileKind("image/jpeg",".jpg");
  throw new IllegalArgumentException("File content must be PDF, JPEG or PNG");
 }
 private boolean startsWith(byte[] value,byte[] prefix){if(value.length<prefix.length)return false;for(int i=0;i<prefix.length;i++)if(value[i]!=prefix[i])return false;return true;}
 private Path safePath(String stored){Path path=root.resolve(stored).normalize();if(!path.startsWith(root))throw new IllegalArgumentException("Invalid document path");return path;}
 private String safeName(String name,String extension){String cleaned=Optional.ofNullable(name).orElse("document"+extension).replace('\r','_').replace('\n','_').replace('"','_');return cleaned.isBlank()?"document"+extension:cleaned;}
 private record FileKind(String contentType,String extension){}
}
