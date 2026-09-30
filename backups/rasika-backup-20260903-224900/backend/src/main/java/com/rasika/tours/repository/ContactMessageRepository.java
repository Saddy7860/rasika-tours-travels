package com.rasika.tours.repository;

import com.rasika.tours.model.ContactMessage;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long> {

}
