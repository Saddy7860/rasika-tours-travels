package com.rasika.tours.service;

import com.rasika.tours.model.ContactMessage;

import com.rasika.tours.repository.ContactMessageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    public ContactMessage saveMessage(ContactMessage message) {

        message.setStatus("NEW");

        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAllMessages() {

        return contactMessageRepository.findAll();
    }

    public ContactMessage markAsRead(Long id) {

        ContactMessage message = contactMessageRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contact message not found"));

        if ("NEW".equals(message.getStatus())) {
            message.setStatus("READ");
        }

        return contactMessageRepository.save(message);
    }

    public ContactMessage replyToMessage(
            Long id,
            String adminReply) {

        ContactMessage message = contactMessageRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contact message not found"));

        message.setAdminReply(adminReply);
        message.setStatus("REPLIED");
        message.setRepliedAt(LocalDateTime.now());

        return contactMessageRepository.save(message);
    }
}
