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
 private final in.tucor.api.storage.DocumentFiles files;

 public BuyerDocumentController(RegistrationDocumentRepository documents,@Value("${tucor.upload-dir:./uploads/registration}") String directory) throws IOException {
  this.files=new in.tucor.api.storage.DocumentFiles(directory);this.documents=documents;this.root=Paths.get(directory).toAbsolutePath().normalize();Files.createDirectories(root);
 }

 public record Doc(String id,String name,String type,String status,long sizeBytes,String uploadedAt,String expiresAt,String rejectionReason,String verifiedAt){}

 @GetMapping
 public List<Doc> all(Authentication authentication){return documents.findByUserIdOrderByCreatedAtDesc(userId(authentication)).stream().map(this::dto).toList();}

 @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 @Transactional(rollbackFor=Exception.class)
 public Doc upload(Authentication authentication,@RequestParam String documentType,@RequestPart("file") MultipartFile file) throws IOException {
  UUID userId=userId(authentication);String type=documentType.trim().toUpperCase(Locale.ROOT);
  if(!TYPES.contains(type))throw new IllegalArgumentException("Unsupported document type");
  RegistrationDocument document=documents.findByUserIdAndDocumentType(userId,type).orElseGet(RegistrationDocument::new);
  String oldStored=document.storedFilename;var stored=files.store(file,MAX_SIZE);
  document.userId=userId;document.documentType=type;document.originalFilename=stored.name();
  document.storedFilename=stored.filename();document.contentType=stored.contentType();document.sizeBytes=stored.size();document.status="PENDING_REVIEW";
  document.rejectionReason=null;document.verifiedBy=null;document.verifiedAt=null;document.expiresAt=null;
  document=documents.save(document);files.deleteAfterCommit(oldStored);
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
  documents.delete(document);files.deleteAfterCommit(document.storedFilename);
 }

 private Path safePath(String stored){return files.path(stored);}
 private String safeOriginalName(String name,String fallbackExtension){return in.tucor.api.storage.DocumentFiles.safeName(name);}
 private UUID userId(Authentication authentication){return UUID.fromString(authentication.getName());}
 private Doc dto(RegistrationDocument document){return new Doc(document.id.toString(),document.originalFilename,document.documentType,document.expiresAt!=null&&document.expiresAt.isBefore(LocalDate.now())?"EXPIRED":document.status,document.sizeBytes,document.createdAt.toString(),document.expiresAt==null?null:document.expiresAt.toString(),document.rejectionReason,document.verifiedAt==null?null:document.verifiedAt.toString());}
 private record FileKind(String contentType,String extension){}
}
