package in.tucor.api.storage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.*;
import java.nio.file.*;
import static org.junit.jupiter.api.Assertions.*;

class DocumentFilesTest {
 @TempDir Path directory;
 @Test void rejectsForgedMimeAndTraversal() throws Exception {
  DocumentFiles files=new DocumentFiles(directory.toString());
  assertThrows(IllegalArgumentException.class,()->files.store(new MockMultipartFile("file","fake.pdf","application/pdf","executable".getBytes()),100));
  assertThrows(IllegalArgumentException.class,()->files.path("../secret"));
 }
 @Test void usesSignatureAndSafeName() throws Exception {
  var file=new DocumentFiles(directory.toString()).store(new MockMultipartFile("file","../../unsafe\r\n.pdf","text/plain","%PDF-1.7 example".getBytes()),100);
  assertEquals("application/pdf",file.contentType());assertFalse(file.name().contains("/"));assertFalse(file.name().contains("\n"));assertTrue(Files.exists(directory.resolve(file.filename())));
 }
 @Test void rollbackRemovesNewFileAndPreservesOld() throws Exception {
  DocumentFiles files=new DocumentFiles(directory.toString());Files.writeString(directory.resolve("old.pdf"),"old");
  TransactionSynchronizationManager.initSynchronization();
  try {
   var stored=files.store(new MockMultipartFile("file","new.pdf","application/pdf","%PDF-new".getBytes()),100);files.deleteAfterCommit("old.pdf");
   TransactionSynchronizationManager.getSynchronizations().forEach(s->s.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
   assertFalse(Files.exists(directory.resolve(stored.filename())));assertTrue(Files.exists(directory.resolve("old.pdf")));
  } finally {TransactionSynchronizationManager.clearSynchronization();}
 }
}
