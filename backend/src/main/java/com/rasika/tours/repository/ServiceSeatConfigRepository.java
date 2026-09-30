package com.rasika.tours.repository;

import com.rasika.tours.model.ServiceSeatConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceSeatConfigRepository
        extends JpaRepository<ServiceSeatConfig, Long> {

    Optional<ServiceSeatConfig> findByBookingTypeAndServiceId(
        String bookingType,
        Long serviceId
    );
}
