package com.rasika.tours.controller;

import com.rasika.tours.model.ContactMessage;
import com.rasika.tours.service.ContactMessageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactMessageController {

    @Autowired
    private ContactMessageService contactMessageService;

    @PostMapping
    public ResponseEntity<?> createMessage(
            @RequestBody ContactMessage message) {

        try {

            return ResponseEntity.ok(
                    contactMessageService.saveMessage(message)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Unable to send message");
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {

        return ResponseEntity.ok(
                contactMessageService.getAllMessages()
        );
    }

    @PutMapping("/admin/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    contactMessageService.markAsRead(id)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/reply")
    public ResponseEntity<?> replyToMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        try {

            String adminReply = body.get("adminReply");

            if (adminReply == null || adminReply.isBlank()) {

                return ResponseEntity.badRequest()
                        .body("Reply cannot be empty");
            }

            return ResponseEntity.ok(
                    contactMessageService.replyToMessage(
                            id,
                            adminReply
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}
