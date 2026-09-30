package com.rasika.tours.repository;

import com.rasika.tours.model.Booking;
import com.rasika.tours.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser(User user);

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByUserOrderByBookingDateDesc(User user);

    List<Booking> findAllByOrderByBookingDateDesc();

    List<Booking> findByBookingTypeAndServiceIdAndBookingStatusNot(
        String bookingType,
        Long serviceId,
        String bookingStatus
    );

    List<Booking> findByBookingTypeAndServiceIdAndJourneyDateAndBookingStatusNot(
        String bookingType,
        Long serviceId,
        LocalDate journeyDate,
        String bookingStatus
    );
}
