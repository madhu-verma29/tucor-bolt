package in.tucor.api.storage;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.io.*;
import java.nio.file.*;
import java.util.*;

/** Local storage adapter. Production still requires durable, private, scanned storage. */
public final class DocumentFiles {
 private final Path root;
 public DocumentFiles(String directory){root=Paths.get(directory).toAbsolutePath().normalize();}
 public record Stored(String filename,String name,String contentType,long size){}
 public Path path(String filename){if(filename==null||filename.isBlank())throw new IllegalArgumentException("Invalid document path");Path p=root.resolve(filename).normalize();if(!p.startsWith(root)||p.equals(root))throw new IllegalArgumentException("Invalid document path");return p;}
 public static String safeName(String name){String s=Optional.ofNullable(name).orElse("document").replace('\\','/');s=s.substring(s.lastIndexOf('/')+1).replaceAll("[\\p{Cntrl}\"]","_");return s.isBlank()?"document":s.substring(0,Math.min(200,s.length()));}
 public Stored store(MultipartFile file,long maxBytes)throws IOException{
  if(file.isEmpty()||file.getSize()>maxBytes)throw new IllegalArgumentException("File is empty or exceeds the upload limit");
  byte[] head;try(InputStream in=file.getInputStream()){head=in.readNBytes(8);}
  String type,extension;
  if(starts(head,new byte[]{0x25,0x50,0x44,0x46,0x2d})){type="application/pdf";extension=".pdf";}
  else if(starts(head,new byte[]{(byte)0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a})){type="image/png";extension=".png";}
  else if(starts(head,new byte[]{(byte)0xff,(byte)0xd8,(byte)0xff})){type="image/jpeg";extension=".jpg";}
  else throw new IllegalArgumentException("File content must be PDF, JPEG or PNG");
  Files.createDirectories(root);String filename=UUID.randomUUID()+extension;Path target=path(filename),temp=Files.createTempFile(root,"upload-",".tmp");
  try{try(InputStream in=file.getInputStream()){Files.copy(in,temp,StandardCopyOption.REPLACE_EXISTING);}if(Files.size(temp)>maxBytes)throw new IllegalArgumentException("File exceeds the upload limit");try{Files.move(temp,target,StandardCopyOption.ATOMIC_MOVE);}catch(AtomicMoveNotSupportedException ex){Files.move(temp,target);} }finally{Files.deleteIfExists(temp);}
  if(TransactionSynchronizationManager.isSynchronizationActive())TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization(){@Override public void afterCompletion(int status){if(status!=STATUS_COMMITTED)removeQuietly(filename);}});
  return new Stored(filename,safeName(file.getOriginalFilename()),type,file.getSize());
 }
 public void deleteAfterCommit(String filename){if(filename==null)return;path(filename);if(TransactionSynchronizationManager.isSynchronizationActive())TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization(){@Override public void afterCommit(){removeQuietly(filename);}});else removeQuietly(filename);}
 private void removeQuietly(String filename){try{Files.deleteIfExists(path(filename));}catch(IOException ex){org.slf4j.LoggerFactory.getLogger(DocumentFiles.class).warn("Document cleanup failed; reconciliation required",ex);}}
 private static boolean starts(byte[] head,byte[] prefix){return head.length>=prefix.length&&Arrays.equals(Arrays.copyOf(head,prefix.length),prefix);}
}
