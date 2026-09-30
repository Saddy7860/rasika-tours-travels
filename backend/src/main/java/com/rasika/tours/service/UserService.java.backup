package com.rasika.tours.service;

import com.rasika.tours.model.User;
import com.rasika.tours.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        return userRepository.save(user);
    }

    public void resetAdminPassword(String email, String newPassword) {

        User user = userRepository.findByEmail(email)
            .orElse(null);

        if (user == null) {
            user = new User();
            user.setFullName("Rasika Admin");
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setPhone("0000000000");
            user.setAddress("Admin");
            user.setRole("ADMIN");
            user.setActive(true);
        } else {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setRole("ADMIN");
            user.setActive(true);
        }

        userRepository.save(user);
    }

    public User authenticate(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("Account is disabled");
        }
        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
