package in.tucor.api.auth;
import org.junit.jupiter.api.Test; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import java.util.Optional; import static org.junit.jupiter.api.Assertions.assertThrows; import static org.mockito.Mockito.*;
class AuthServiceTest {
private AuthService service(UserRepository users){return new AuthService(users,mock(RefreshTokenRepository.class),mock(AuthActionTokenRepository.class),new BCryptPasswordEncoder(),mock(JwtService.class),mock(MailService.class),30,15);}
@Test void blocksAdminSelfRegistration(){UserRepository users=mock(UserRepository.class);AuthService s=service(users);assertThrows(IllegalArgumentException.class,()->s.register(new AuthDtos.Register("admin@tucor.in","Password@123",Role.ADMIN)));}
@Test void rejectsDuplicateEmail(){UserRepository users=mock(UserRepository.class);when(users.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(new User()));AuthService s=service(users);assertThrows(IllegalArgumentException.class,()->s.register(new AuthDtos.Register("a@b.com","Password@123",Role.BUYER)));}
}