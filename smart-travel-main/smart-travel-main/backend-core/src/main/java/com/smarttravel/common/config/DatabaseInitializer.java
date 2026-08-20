package com.smarttravel.common.config;

import com.smarttravel.auth.entity.UserAuth;
import com.smarttravel.auth.enums.AuthProvider;
import com.smarttravel.auth.repository.UserAuthRepository;
import com.smarttravel.common.enums.Role;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer {

    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void init() {
        // Seed Admin if not exists
        if (!userRepository.existsByEmail("admin@smarttravel.com")) {
            User admin = userRepository.save(User.builder()
                    .email("admin@smarttravel.com")
                    .name("System Admin")
                    .hasCompletedOnboarding(true)
                    .build());

            userAuthRepository.save(UserAuth.builder()
                    .user(admin)
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .authProvider(AuthProvider.LOCAL)
                    .role(Role.ADMIN)
                    .build());
        }

        // Seed User if not exists
        if (!userRepository.existsByEmail("user@smarttravel.com")) {
            User user = userRepository.save(User.builder()
                    .email("user@smarttravel.com")
                    .name("Normal User")
                    .hasCompletedOnboarding(true)
                    .build());

            userAuthRepository.save(UserAuth.builder()
                    .user(user)
                    .passwordHash(passwordEncoder.encode("user123"))
                    .authProvider(AuthProvider.LOCAL)
                    .role(Role.USER)
                    .build());
        }

        // Seed or sync Phuoc Nguyen User password
        userRepository.findByEmail("phuocnguyen@gmail.com").ifPresentOrElse(
            existingUser -> {
                userAuthRepository.findByUserId(existingUser.getId()).ifPresent(auth -> {
                    auth.setPasswordHash(passwordEncoder.encode("user123"));
                    userAuthRepository.save(auth);
                });
            },
            () -> {
                User user2 = userRepository.save(User.builder()
                        .email("phuocnguyen@gmail.com")
                        .name("Phước Nguyễn")
                        .hasCompletedOnboarding(true)
                        .build());

                userAuthRepository.save(UserAuth.builder()
                        .user(user2)
                        .passwordHash(passwordEncoder.encode("user123"))
                        .authProvider(AuthProvider.LOCAL)
                        .role(Role.USER)
                        .build());
            }
        );
    }
}
