package com.rasika.tours.controller;

import com.rasika.tours.model.PassportRequest;
import com.rasika.tours.model.User;
import com.rasika.tours.service.PassportService;
import com.rasika.tours.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passport")
@CrossOrigin(origins = "http://localhost:3000")
public class PassportController {

    @Autowired
    private PassportService passportService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestBody PassportRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Please login before submitting a passport request");
        }

        try {

            User user = userService.getUserByEmail(
                    authentication.getName()
            );

            request.setUser(user);

            PassportRequest saved =
                    passportService.createRequest(request);

            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Please login first");
        }

        User user = userService.getUserByEmail(
                authentication.getName()
        );

        List<PassportRequest> requests =
                passportService.getUserRequests(user);

        return ResponseEntity.ok(requests);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllRequests(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Please login first");
        }

        User user = userService.getUserByEmail(
                authentication.getName()
        );

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Admin access required");
        }

        return ResponseEntity.ok(
                passportService.getAllRequests()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Please login first");
        }

        try {

            User user = userService.getUserByEmail(
                    authentication.getName()
            );

            PassportRequest request =
                    passportService.getRequestById(id);

            boolean isAdmin =
                    "ADMIN".equalsIgnoreCase(user.getRole());

            boolean isOwner =
                    request.getUser() != null &&
                    request.getUser().getId()
                            .equals(user.getId());

            if (!isAdmin && !isOwner) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("You do not have access to this request");
            }

            return ResponseEntity.ok(request);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Please login first");
        }

        User user = userService.getUserByEmail(
                authentication.getName()
        );

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Admin access required");
        }

        try {

            String status = updates.get("status");
            String remarks = updates.get("remarks");

            return ResponseEntity.ok(
                    passportService.updateStatus(
                            id,
                            status,
                            remarks
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}
