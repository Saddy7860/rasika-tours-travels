package com.rasika.tours.service;

import com.rasika.tours.model.PassportRequest;
import com.rasika.tours.model.User;
import com.rasika.tours.repository.PassportRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class PassportService {

    private static final Set<String> VALID_STATUSES =
            Set.of(
                    "PENDING",
                    "UNDER_REVIEW",
                    "APPROVED",
                    "REJECTED",
                    "COMPLETED"
            );

    @Autowired
    private PassportRepository passportRepository;

    public PassportRequest createRequest(
            PassportRequest request) {

        if (request.getFullName() == null ||
                request.getFullName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Full name is required"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (request.getPhone() == null ||
                request.getPhone().trim().isEmpty()) {

            throw new RuntimeException(
                    "Phone number is required"
            );
        }

        if (!"NEW".equalsIgnoreCase(
                request.getServiceType())
                &&
                !"RENEWAL".equalsIgnoreCase(
                        request.getServiceType())) {

            throw new RuntimeException(
                    "Invalid passport service type"
            );
        }

        if ("RENEWAL".equalsIgnoreCase(
                request.getServiceType())
                &&
                (request.getExistingPassportNumber() == null
                        ||
                        request
                                .getExistingPassportNumber()
                                .trim()
                                .isEmpty())) {

            throw new RuntimeException(
                    "Existing passport number is required for renewal"
            );
        }

        request.setStatus("PENDING");
        request.setRequestDate(
                LocalDateTime.now()
        );

        return passportRepository.save(request);
    }

    public List<PassportRequest> getUserRequests(
            User user) {

        return passportRepository
                .findByUserOrderByRequestDateDesc(user);
    }

    public List<PassportRequest> getAllRequests() {

        return passportRepository
                .findAllByOrderByRequestDateDesc();
    }

    public PassportRequest updateStatus(
            Long id,
            String status,
            String remarks) {

        PassportRequest request =
                passportRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Passport request not found"
                                )
                        );

        if (status == null ||
                status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        String normalizedStatus =
                status.trim()
                        .toUpperCase()
                        .replace(" ", "_");

        if (!VALID_STATUSES.contains(
                normalizedStatus)) {

            throw new RuntimeException(
                    "Invalid passport status"
            );
        }

        request.setStatus(normalizedStatus);

        if (remarks != null) {

            request.setRemarks(
                    remarks.trim()
            );
        }

        if ("COMPLETED".equals(
                normalizedStatus)) {

            request.setCompletionDate(
                    LocalDateTime.now()
            );

        } else {

            request.setCompletionDate(null);
        }

        return passportRepository.save(request);
    }

    public PassportRequest getRequestById(
            Long id) {

        return passportRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Passport request not found"
                        )
                );
    }
}
