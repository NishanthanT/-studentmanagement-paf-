package com.smartcampus.hub.config;

import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.AuthProvider;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@campus.com";
        // Seed default purely if missing, maintaining robust persistence checks
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .fullName("Super Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .phoneNumber("0000000000")
                    .role(Role.ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .status(AccountStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            System.out.println("Default Master Admin Account Seeded: admin@campus.com");
        }
    }
}
