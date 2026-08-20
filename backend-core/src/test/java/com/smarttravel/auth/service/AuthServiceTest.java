package com.smarttravel.auth.service;

import com.smarttravel.auth.dto.AuthResult;
import com.smarttravel.auth.dto.LoginRequest;
import com.smarttravel.auth.dto.RegisterRequest;
import com.smarttravel.auth.entity.RefreshToken;
import com.smarttravel.auth.entity.UserAuth;
import com.smarttravel.auth.enums.AuthProvider;
import com.smarttravel.auth.repository.PasswordResetTokenRepository;
import com.smarttravel.auth.repository.RefreshTokenRepository;
import com.smarttravel.auth.repository.UserAuthRepository;
import com.smarttravel.common.enums.Role;
import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.common.service.EmailService;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock UserAuthRepository userAuthRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock JwtService jwtService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock EmailService emailService;

    @InjectMocks
    AuthService authService;

    @BeforeEach
    void setUp() {
        // Inject @Value fields không đi qua Spring context
        ReflectionTestUtils.setField(authService, "refreshTokenExpirationMs", 604800000L); // 7 days
        ReflectionTestUtils.setField(authService, "otpExpiryMinutes", 10);
        ReflectionTestUtils.setField(authService, "otpRequestCooldownSeconds", 60);
    }

    // =========================================================================
    // register()
    // =========================================================================

    @Nested
    @DisplayName("register()")
    class RegisterTests {

        private final RegisterRequest validRequest =
                new RegisterRequest("Nguyen Van A", "user@example.com", "password123");

        @Test
        @DisplayName("Happy path: đăng ký thành công, trả về accessToken và refreshToken")
        void register_validRequest_returnsAuthResult() {
            // Arrange
            UUID userId = UUID.randomUUID();
            User savedUser = User.builder().id(userId).email("user@example.com").name("Nguyen Van A").build();

            when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(userAuthRepository.save(any(UserAuth.class))).thenReturn(null);
            when(passwordEncoder.encode(anyString())).thenReturn("hashed-password");
            when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("mock-access-token");
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            AuthResult result = authService.register(validRequest);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.response().accessToken()).isEqualTo("mock-access-token");
            assertThat(result.response().email()).isEqualTo("user@example.com");
            assertThat(result.response().role()).isEqualTo(Role.USER);
            assertThat(result.refreshToken()).isNotBlank();

            // Verify user được lưu đúng
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getEmail()).isEqualTo("user@example.com");

            // Verify userAuth được lưu với role USER và provider LOCAL
            ArgumentCaptor<UserAuth> authCaptor = ArgumentCaptor.forClass(UserAuth.class);
            verify(userAuthRepository).save(authCaptor.capture());
            assertThat(authCaptor.getValue().getRole()).isEqualTo(Role.USER);
            assertThat(authCaptor.getValue().getAuthProvider()).isEqualTo(AuthProvider.LOCAL);
        }

        @Test
        @DisplayName("Email đã tồn tại: ném BadRequestException")
        void register_duplicateEmail_throwsBadRequestException() {
            // Arrange
            when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(validRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Email already in use");

            // Verify không lưu gì xuống DB
            verify(userRepository, never()).save(any());
            verify(userAuthRepository, never()).save(any());
        }
    }

    // =========================================================================
    // login()
    // =========================================================================

    @Nested
    @DisplayName("login()")
    class LoginTests {

        private final LoginRequest validRequest = new LoginRequest("user@example.com", "password123");

        private User activeUser;
        private UserAuth userAuth;

        @BeforeEach
        void setUpLoginFixtures() {
            activeUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("user@example.com")
                    .name("Nguyen Van A")
                    .isActive(true)
                    .build();
            userAuth = UserAuth.builder()
                    .user(activeUser)
                    .passwordHash("hashed-password")
                    .authProvider(AuthProvider.LOCAL)
                    .role(Role.USER)
                    .build();
        }

        @Test
        @DisplayName("Happy path: đăng nhập thành công, trả về token")
        void login_validCredentials_returnsAuthResult() {
            // Arrange
            when(userAuthRepository.findByUserEmailWithUser("user@example.com"))
                    .thenReturn(Optional.of(userAuth));
            when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
            when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("mock-access-token");
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // Act
            AuthResult result = authService.login(validRequest);

            // Assert
            assertThat(result.response().accessToken()).isEqualTo("mock-access-token");
            assertThat(result.response().email()).isEqualTo("user@example.com");
            assertThat(result.response().role()).isEqualTo(Role.USER);
        }

        @Test
        @DisplayName("Email không tồn tại: ném BadRequestException")
        void login_emailNotFound_throwsBadRequestException() {
            // Arrange
            when(userAuthRepository.findByUserEmailWithUser("user@example.com"))
                    .thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> authService.login(validRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid email or password");
        }

        @Test
        @DisplayName("Sai mật khẩu: ném BadRequestException")
        void login_wrongPassword_throwsBadRequestException() {
            // Arrange
            when(userAuthRepository.findByUserEmailWithUser("user@example.com"))
                    .thenReturn(Optional.of(userAuth));
            when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> authService.login(validRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid email or password");
        }

        @Test
        @DisplayName("Tài khoản bị khóa: ném BadRequestException")
        void login_inactiveAccount_throwsBadRequestException() {
            // Arrange
            activeUser.setIsActive(false);
            when(userAuthRepository.findByUserEmailWithUser("user@example.com"))
                    .thenReturn(Optional.of(userAuth));
            when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.login(validRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("bị khóa");
        }

        @Test
        @DisplayName("JWT token được generate với đúng userId, email, role")
        void login_success_generateTokenWithCorrectClaims() {
            // Arrange
            when(userAuthRepository.findByUserEmailWithUser("user@example.com"))
                    .thenReturn(Optional.of(userAuth));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("tok");
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // Act
            authService.login(validRequest);

            // Assert: jwtService được gọi với đúng role
            verify(jwtService).generateAccessToken(activeUser.getId(), "user@example.com", "USER");
        }
    }
}
