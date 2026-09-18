package in.tucor.api;
import org.springframework.http.*;import org.springframework.web.bind.MethodArgumentNotValidException;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestControllerAdvice public class ApiExceptionHandler {
 public record ErrorBody(String error){}
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<ErrorBody> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(new ErrorBody(e.getMessage()));}
 @ExceptionHandler(NoSuchElementException.class) public ResponseEntity<ErrorBody> missing(NoSuchElementException e){return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorBody("Resource not found"));}
 @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<ErrorBody> validation(MethodArgumentNotValidException e){String m=e.getBindingResult().getFieldErrors().stream().findFirst().map(x->x.getField()+": "+x.getDefaultMessage()).orElse("Validation failed");return ResponseEntity.badRequest().body(new ErrorBody(m));}
}