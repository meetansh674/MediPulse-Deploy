package com.medipulse.backend.config;

import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.repository.DoctorRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean demoDataEnabled;

    public DataInitializer(UserRepository userRepository,
    DoctorRepository doctorRepository,
    PasswordEncoder passwordEncoder,
    @Value("${app.demo-data-enabled:true}") boolean demoDataEnabled) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoDataEnabled = demoDataEnabled;
    }

@Override
@Transactional
public void run(String... args) {
    if (!demoDataEnabled) {
        System.out.println(">>> [MediPulse] Demo data seeding disabled (app.demo-data-enabled=false). Existing accounts left untouched.");
        return;
    }


    Optional<User> adminOpt = userRepository.findByEmail("admin@medipulse.com");
    if (adminOpt.isEmpty()) {
        User admin = new User();
        admin.setName("System Administrator");
        admin.setEmail("admin@medipulse.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(User.Role.ADMIN);
        admin.setActive(true);
        admin.setPhone("9998887770");
        admin.setCreatedAt(LocalDateTime.now());
        userRepository.save(admin);
        System.out.println(">>> [MediPulse] Seeded Admin: admin@medipulse.com / Admin@123");
    } else {
    User admin = adminOpt.get();
    admin.setPassword(passwordEncoder.encode("Admin@123"));
    userRepository.save(admin);
    System.out.println(">>> [MediPulse] Verified Admin password: admin@medipulse.com / Admin@123");
}
}
}
