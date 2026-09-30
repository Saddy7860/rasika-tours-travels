package com.rasika.tours.service;

import com.rasika.tours.model.Booking;
import com.rasika.tours.model.User;
import com.rasika.tours.repository.BookingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FlightService flightService;

    @Autowired
    private TrainService trainService;

    @Autowired
    private BusService busService;

    public Booking createBooking(Booking booking) {

        if (booking.getNumberOfPassengers() == null ||
            booking.getNumberOfPassengers() <= 0) {
            throw new RuntimeException("Invalid number of passengers");
        }

        validateAvailableSeats(
            booking.getBookingType(),
            booking.getServiceId(),
            booking.getNumberOfPassengers()
        );

        booking.setBookingReference(
            "RSK" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase()
        );

        switch (booking.getBookingType().toUpperCase()) {

            case "FLIGHT":
                flightService.updateAvailableSeats(
                    booking.getServiceId(),
                    booking.getNumberOfPassengers()
                );
                break;

            case "TRAIN":
                trainService.updateAvailableSeats(
                    booking.getServiceId(),
                    booking.getNumberOfPassengers()
                );
                break;

            case "BUS":
                busService.updateAvailableSeats(
                    booking.getServiceId(),
                    booking.getNumberOfPassengers()
                );
                break;

            default:
                throw new RuntimeException("Invalid booking type");
        }

        return bookingRepository.save(booking);
    }

    private void validateAvailableSeats(
            String bookingType,
            Long serviceId,
            Integer passengers) {

        switch (bookingType.toUpperCase()) {

            case "FLIGHT":
                if (flightService.getFlightById(serviceId)
                        .getAvailableSeats() < passengers) {
                    throw new RuntimeException(
                        "Not enough seats available"
                    );
                }
                break;

            case "TRAIN":
                if (trainService.getTrainById(serviceId)
                        .getAvailableSeats() < passengers) {
                    throw new RuntimeException(
                        "Not enough seats available"
                    );
                }
                break;

            case "BUS":
                if (busService.getBusById(serviceId)
                        .getAvailableSeats() < passengers) {
                    throw new RuntimeException(
                        "Not enough seats available"
                    );
                }
                break;

            default:
                throw new RuntimeException("Invalid booking type");
        }
    }

    public List<Booking> getUserBookings(User user) {
        return bookingRepository.findByUserOrderByBookingDateDesc(user);
    }

    public Booking getBookingByReference(String reference) {
        return bookingRepository.findByBookingReference(reference)
                .orElseThrow(() ->
                    new RuntimeException("Booking not found")
                );
    }

    public Booking cancelBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                    new RuntimeException("Booking not found")
                );

        if ("CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new RuntimeException(
                "Booking is already cancelled"
            );
        }

        restoreSeats(
            booking.getBookingType(),
            booking.getServiceId(),
            booking.getNumberOfPassengers()
        );

        booking.setBookingStatus("CANCELLED");

        if ("COMPLETED".equalsIgnoreCase(
                booking.getPaymentStatus())) {

            booking.setPaymentStatus("REFUND_PENDING");
        }

        return bookingRepository.save(booking);
    }


    public Booking updateRefundStatus(
            Long bookingId,
            String refundStatus) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found")
                );

        if (!"CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus())) {

            throw new RuntimeException(
                    "Refund can only be processed for cancelled bookings"
            );
        }

        if (refundStatus == null || refundStatus.trim().isEmpty()) {
            throw new RuntimeException("Refund status is required");
        }

        String normalizedStatus =
                refundStatus.trim().toUpperCase().replace(" ", "_");

        booking.setRefundStatus(normalizedStatus);

        switch (normalizedStatus) {

            case "PENDING":
                booking.setPaymentStatus("REFUND_PENDING");
                break;

            case "PROCESSING":
                booking.setPaymentStatus("REFUND_PROCESSING");
                break;

            case "COMPLETED":
            case "REFUNDED":
                booking.setPaymentStatus("REFUNDED");
                break;

            case "REJECTED":
                booking.setPaymentStatus("REFUND_REJECTED");
                break;

            default:
                throw new RuntimeException("Invalid refund status");
        }

        return bookingRepository.save(booking);
    }


    private void restoreSeats(
            String bookingType,
            Long serviceId,
            Integer passengers) {

        switch (bookingType.toUpperCase()) {

            case "FLIGHT":
                flightService.restoreSeats(
                    serviceId,
                    passengers
                );
                break;

            case "TRAIN":
                trainService.restoreSeats(
                    serviceId,
                    passengers
                );
                break;

            case "BUS":
                busService.restoreSeats(
                    serviceId,
                    passengers
                );
                break;
        }
    }


    public List<Booking> getAllBookings() {

        return bookingRepository.findAllByOrderByBookingDateDesc();

    }

    public long getTotalBookings() {

        return bookingRepository.count();

    }

    public long getConfirmedBookings() {

        return bookingRepository
                .findAll()
                .stream()
                .filter(booking ->
                        !"CANCELLED".equalsIgnoreCase(
                                booking.getBookingStatus()
                        )
                )
                .count();

    }

    public long getCancelledBookings() {

        return bookingRepository
                .findAll()
                .stream()
                .filter(booking ->
                        "CANCELLED".equalsIgnoreCase(
                                booking.getBookingStatus()
                        )
                )
                .count();

    }

    public double getTotalRevenue() {

        return bookingRepository
                .findAll()
                .stream()
                .filter(booking ->
                        !"CANCELLED".equalsIgnoreCase(
                                booking.getBookingStatus()
                        )
                )
                .mapToDouble(booking ->
                        booking.getTotalAmount() != null
                                ? booking.getTotalAmount()
                                : 0
                )
                .sum();

    }


}
