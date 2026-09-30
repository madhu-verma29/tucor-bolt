package in.tucor.api;
import org.springframework.http.*;import org.springframework.web.bind.MethodArgumentNotValidException;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class) public ResponseEntity<ErrorBody> conflict(){return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody("This change conflicts with existing data; reload and retry"));}
 @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class) public ResponseEntity<ErrorBody> tooLarge(){return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(new ErrorBody("Upload exceeds the size limit"));}
 public record ErrorBody(String error){}
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<ErrorBody> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(new ErrorBody(e.getMessage()));}
 @ExceptionHandler(NoSuchElementException.class) public ResponseEntity<ErrorBody> missing(NoSuchElementException e){return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorBody("Resource not found"));}
 @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<ErrorBody> validation(MethodArgumentNotValidException e){String m=e.getBindingResult().getFieldErrors().stream().findFirst().map(x->x.getField()+": "+x.getDefaultMessage()).orElse("Validation failed");return ResponseEntity.badRequest().body(new ErrorBody(m));}
}