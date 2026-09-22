package in.tucor.api.admin;

import in.tucor.api.auth.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBootstrap implements CommandLineRunner {
 private final UserRepository users;private final PasswordEncoder encoder;private final String email;private final String password;
 public AdminBootstrap(UserRepository users,PasswordEncoder encoder,@Value("${tucor.admin.bootstrap-email:admin@tucor.in}") String email,@Value("${tucor.admin.bootstrap-password:}") String password){this.users=users;this.encoder=encoder;this.email=email;this.password=password;}
 @Override @Transactional public void run(String... args){if(password==null||password.isBlank())return;users.findByEmailIgnoreCase(email).orElseGet(()->{User u=new User();u.email=email.trim().toLowerCase();u.passwordHash=encoder.encode(password);u.role=Role.ADMIN;u.status="ACTIVE";u.emailVerified=true;return users.save(u);});}
}
