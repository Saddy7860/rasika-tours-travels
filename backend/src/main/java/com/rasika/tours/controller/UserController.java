package com.rasika.tours.controller;

import com.rasika.tours.dto.AuthResponse;
import com.rasika.tours.dto.LoginRequest;
import com.rasika.tours.dto.ForgotPasswordRequest;
import com.rasika.tours.dto.ResetPasswordRequest;

import com.rasika.tours.model.User;
import com.rasika.tours.security.JwtUtil;
import com.rasika.tours.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${CORS_ALLOWED_ORIGINS:http://localhost:3000}")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user
    ) {

        try {

            User registeredUser =
                    userService.registerUser(user);

            return ResponseEntity
                    .ok(registeredUser);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            User user =
                    userService.authenticate(
                            request.getEmail(),
                            request.getPassword()
                    );

            String token =
                    jwtUtil.generateToken(
                            user.getEmail(),
                            user.getRole()
                    );

            AuthResponse response =
                    new AuthResponse(
                            token,
                            user.getId(),
                            user.getFullName(),
                            user.getEmail(),
                            user.getRole()
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {

        try {

            userService.requestPasswordReset(
                    request.getEmail()
            );

        } catch (Exception e) {

            System.err.println(
                    "Password reset request error: " +
                    e.getMessage()
            );
        }

        return ResponseEntity.ok(
                "If an account exists with this email, " +
                "a password reset link has been sent."
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {

        try {

            userService.resetPassword(
                    request.getToken(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(
                    "Password reset successfully. " +
                    "You can now log in."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(
            Authentication auth
    ) {

        User user =
                userService.getUserByEmail(
                        auth.getName()
                );

        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id
    ) {

        User user =
                userService.getUserById(id);

        return ResponseEntity.ok(user);
    }
}
