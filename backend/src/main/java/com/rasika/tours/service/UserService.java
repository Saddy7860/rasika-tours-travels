package com.rasika.tours.service;

import com.rasika.tours.model.User;
import com.rasika.tours.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public User registerUser(User user) {

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        if (user.getPassword() == null ||
                user.getPassword().length() < 8) {
            throw new RuntimeException(
                    "Password must contain at least 8 characters"
            );
        }

        user.setEmail(user.getEmail().trim().toLowerCase());

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        user.setRole("USER");
        user.setActive(true);

        return userRepository.save(user);
    }

    public User authenticate(
            String email,
            String rawPassword
    ) {

        String normalizedEmail =
                email == null ? "" :
                        email.trim().toLowerCase();

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                rawPassword,
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException(
                    "Account is disabled"
            );
        }

        return user;
    }

    public void requestPasswordReset(String email) {

        if (email == null || email.trim().isEmpty()) {
            return;
        }

        User user = userRepository
                .findByEmail(
                        email.trim().toLowerCase()
                )
                .orElse(null);

        if (user == null) {
            return;
        }

        String token = generateSecureToken();

        user.setPasswordResetToken(token);

        user.setPasswordResetTokenExpiry(
                LocalDateTime.now().plusMinutes(15)
        );

        userRepository.save(user);

        sendPasswordResetEmail(
                user,
                token
        );
    }

    public void resetPassword(
            String token,
            String newPassword
    ) {

        if (token == null ||
                token.trim().isEmpty()) {
            throw new RuntimeException(
                    "Invalid or expired reset token"
            );
        }

        if (newPassword == null ||
                newPassword.length() < 8) {
            throw new RuntimeException(
                    "Password must contain at least 8 characters"
            );
        }

        User user = userRepository
                .findByPasswordResetToken(token)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid or expired reset token"
                        )
                );

        LocalDateTime expiry =
                user.getPasswordResetTokenExpiry();

        if (expiry == null ||
                expiry.isBefore(
                        LocalDateTime.now()
                )) {

            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiry(null);

            userRepository.save(user);

            throw new RuntimeException(
                    "Reset token has expired"
            );
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);

        userRepository.save(user);
    }

    private String generateSecureToken() {

        byte[] randomBytes =
                new byte[32];

        new SecureRandom()
                .nextBytes(randomBytes);

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    private void sendPasswordResetEmail(
            User user,
            String token
    ) {

        String resetLink =
                frontendUrl +
                "/reset-password?token=" +
                token;

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(user.getEmail());

        if (mailFrom != null &&
                !mailFrom.trim().isEmpty()) {
            message.setFrom(mailFrom);
        }

        message.setSubject(
                "Reset your Rasika Tours & Travels password"
        );

        message.setText(
                "Hello " +
                user.getFullName() +
                ",\n\n" +

                "We received a request to reset your password.\n\n" +

                "Use the link below to create a new password:\n\n" +

                resetLink +

                "\n\nThis link expires in 15 minutes.\n\n" +

                "If you did not request this password reset, " +
                "you can safely ignore this email.\n\n" +

                "Rasika Tours & Travels"
        );

        mailSender.send(message);
    }

    public void resetAdminPassword(
            String email,
            String newPassword
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {

            user = new User();

            user.setFullName(
                    "Rasika Admin"
            );

            user.setEmail(email);

            user.setPassword(
                    passwordEncoder.encode(
                            newPassword
                    )
            );

            user.setPhone("0000000000");

            user.setAddress("Admin");

            user.setRole("ADMIN");

            user.setActive(true);

        } else {

            user.setPassword(
                    passwordEncoder.encode(
                            newPassword
                    )
            );

            user.setRole("ADMIN");

            user.setActive(true);
        }

        userRepository.save(user);
    }

    public User getUserByEmail(
            String email
    ) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    public User getUserById(
            Long id
    ) {

        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }
}
