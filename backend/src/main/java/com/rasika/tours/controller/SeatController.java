package com.rasika.tours.controller;

import com.rasika.tours.model.ServiceSeatConfig;
import com.rasika.tours.model.User;
import com.rasika.tours.service.SeatConfigurationService;
import com.rasika.tours.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class SeatController {

    @Autowired
    private SeatConfigurationService seatService;

    @Autowired
    private UserService userService;

    @GetMapping("/seats")
    public ResponseEntity<?> getSeats(
        @RequestParam String type,
        @RequestParam Long serviceId,
        @RequestParam String journeyDate,
        @RequestParam(required = false) String travelClass
    ) {

        try {

            LocalDate date =
                LocalDate.parse(journeyDate);

            return ResponseEntity.ok(
                seatService.buildSeatMap(
                    type,
                    serviceId,
                    date
                )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                .badRequest()
                .body(e.getMessage());
        }
    }

    @GetMapping("/admin/seats/config")
    public ResponseEntity<?> getConfig(
        @RequestParam String type,
        @RequestParam Long serviceId,
        Authentication authentication
    ) {

        if (!isAdmin(authentication)) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Admin access required");
        }

        try {

            return ResponseEntity.ok(
                seatService.getOrCreate(
                    type,
                    serviceId
                )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                .badRequest()
                .body(e.getMessage());
        }
    }

    @PutMapping("/admin/seats/config")
    public ResponseEntity<?> saveConfig(
        @RequestBody Map<String, Object> request,
        Authentication authentication
    ) {

        if (!isAdmin(authentication)) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Admin access required");
        }

        try {

            String type =
                String.valueOf(
                    request.get("bookingType")
                );

            Long serviceId =
                Long.valueOf(
                    String.valueOf(
                        request.get("serviceId")
                    )
                );

            Integer capacity =
                Integer.valueOf(
                    String.valueOf(
                        request.get("seatCapacity")
                    )
                );

            String layout =
                String.valueOf(
                    request.get("layout")
                );

            return ResponseEntity.ok(
                seatService.saveConfig(
                    type,
                    serviceId,
                    capacity,
                    layout
                )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                .badRequest()
                .body(e.getMessage());
        }
    }

    @PutMapping("/admin/seats/block")
    public ResponseEntity<?> blockSeat(
        @RequestBody Map<String, Object> request,
        Authentication authentication
    ) {

        if (!isAdmin(authentication)) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Admin access required");
        }

        try {

            String type =
                String.valueOf(
                    request.get("bookingType")
                );

            Long serviceId =
                Long.valueOf(
                    String.valueOf(
                        request.get("serviceId")
                    )
                );

            String seatNumber =
                String.valueOf(
                    request.get("seatNumber")
                );

            boolean blocked =
                Boolean.parseBoolean(
                    String.valueOf(
                        request.get("blocked")
                    )
                );

            return ResponseEntity.ok(
                seatService.setBlocked(
                    type,
                    serviceId,
                    seatNumber,
                    blocked
                )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                .badRequest()
                .body(e.getMessage());
        }
    }

    private boolean isAdmin(
        Authentication authentication
    ) {

        if (
            authentication == null ||
            !authentication.isAuthenticated()
        ) {
            return false;
        }

        try {

            User user =
                userService.getUserByEmail(
                    authentication.getName()
                );

            return user != null &&
                "ADMIN".equalsIgnoreCase(
                    user.getRole()
                );

        } catch (Exception e) {
            return false;
        }
    }
}
