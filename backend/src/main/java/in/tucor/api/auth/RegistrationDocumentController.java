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
 private final in.tucor.api.storage.DocumentFiles files;

 public RegistrationDocumentController(UserRepository users,RegistrationDocumentRepository documents,@Value("${tucor.upload-dir:./uploads/registration}") String directory) throws IOException {
  this.users=users;this.documents=documents;this.files=new in.tucor.api.storage.DocumentFiles(directory);
 }

 @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 @Transactional(rollbackFor=Exception.class)
 public ResponseEntity<Map<String,Object>> upload(Authentication authentication,@RequestParam String documentType,@RequestPart("file") MultipartFile file) throws IOException {
  UUID userId=UUID.fromString(authentication.getName());User owner=users.findById(userId).orElseThrow(()->new IllegalArgumentException("Registration account not found"));
  String type=documentType.trim().toUpperCase(Locale.ROOT);if(!TYPES.contains(type))throw new IllegalArgumentException("Unsupported document type");if(owner.role==Role.SELLER&&"FSSAI_OR_REGISTRATION".equals(type))type="FSSAI";
  RegistrationDocument document=documents.findByUserIdAndDocumentType(userId,type).orElseGet(RegistrationDocument::new);
  String oldStored=document.storedFilename;var stored=files.store(file,MAX_SIZE);
  document.userId=userId;document.documentType=type;document.originalFilename=stored.name();
  document.storedFilename=stored.filename();document.contentType=stored.contentType();document.sizeBytes=stored.size();document.status="PENDING_REVIEW";
  document.rejectionReason=null;document.verifiedBy=null;document.verifiedAt=null;document.expiresAt=null;documents.save(document);files.deleteAfterCommit(oldStored);
  return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id",document.id,"documentType",document.documentType,"fileName",document.originalFilename,"status",document.status));
 }

}
