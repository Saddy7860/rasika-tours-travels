package com.rasika.tours.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rasika.tours.model.Booking;
import com.rasika.tours.model.Bus;
import com.rasika.tours.model.Flight;
import com.rasika.tours.model.Train;
import com.rasika.tours.model.User;
import com.rasika.tours.repository.BookingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SeatConfigurationService seatConfigurationService;

    @Transactional
    public synchronized Booking createBooking(
        Booking booking,
        User user
    ) {

        if (booking == null) {
            throw new RuntimeException(
                "Booking details are required"
            );
        }

        if (user == null) {
            throw new RuntimeException(
                "User is required"
            );
        }

        if (booking.getJourneyDate() == null) {
            booking.setJourneyDate(LocalDate.now());
        }

        if (
            booking.getJourneyDate()
                .isBefore(LocalDate.now())
        ) {
            throw new RuntimeException(
                "Journey date cannot be in the past"
            );
        }

        if (
            booking.getBookingType() == null ||
            booking.getBookingType()
                .trim()
                .isEmpty()
        ) {
            throw new RuntimeException(
                "Booking type is required"
            );
        }

        if (booking.getServiceId() == null) {
            throw new RuntimeException(
                "Service is required"
            );
        }

        if (
            booking.getNumberOfPassengers() == null ||
            booking.getNumberOfPassengers() <= 0
        ) {
            throw new RuntimeException(
                "Invalid number of passengers"
            );
        }

        if (
            booking.getNumberOfPassengers() > 50
        ) {
            throw new RuntimeException(
                "Maximum 50 passengers can be booked at once"
            );
        }

        String bookingType =
            booking.getBookingType()
                .trim()
                .toUpperCase();

        booking.setBookingType(bookingType);
        booking.setUser(user);

        double basePrice =
            getServicePrice(
                bookingType,
                booking.getServiceId()
            );

        String requestedClass =
            getRequestedTravelClass(
                booking.getPassengerDetails()
            );

        if (
            requestedClass == null ||
            requestedClass.trim().isEmpty()
        ) {
            requestedClass =
                booking.getTravelClass();
        }

        String selectedClass =
            normalizeTravelClass(
                bookingType,
                requestedClass
            );

        double pricePerPassenger =
            basePrice *
            getClassMultiplier(
                bookingType,
                selectedClass
            );

        double totalAmount =
            Math.round(
                pricePerPassenger *
                booking.getNumberOfPassengers() *
                100.0
            ) / 100.0;

        String paymentType =
            getPaymentType(
                booking.getPassengerDetails()
            );

        double amountPaid;

        if ("HALF".equals(paymentType)) {
            amountPaid =
                Math.round(
                    (totalAmount / 2.0) *
                    100.0
                ) / 100.0;
        } else {
            paymentType = "FULL";
            amountPaid = totalAmount;
        }

        double remainingAmount =
            Math.round(
                (totalAmount - amountPaid) *
                100.0
            ) / 100.0;

        String requestedSeats =
            getRequestedSeats(
                booking.getPassengerDetails()
            );

        /*
         * IMPORTANT:
         * Seat availability is now calculated by
         * service + journey date.
         *
         * We DO NOT decrement Bus/Train/Flight
         * availableSeats here.
         */
        String assignedSeats =
            seatConfigurationService
                .validateOrAllocateSeats(
                    bookingType,
                    booking.getServiceId(),
                    booking.getJourneyDate(),
                    booking.getNumberOfPassengers(),
                    requestedSeats
                );

        booking.setTotalAmount(totalAmount);
        booking.setPaymentStatus(
            amountPaid >= totalAmount
                ? "COMPLETED"
                : "PARTIAL"
        );
        booking.setBookingStatus("CONFIRMED");
        booking.setRefundStatus(null);
        booking.setTravelClass(selectedClass);
        booking.setSeatNumbers(assignedSeats);

        booking.setPassengerDetails(
            updateBookingDetails(
                booking.getPassengerDetails(),
                selectedClass,
                assignedSeats,
                paymentType,
                amountPaid,
                remainingAmount
            )
        );

        String reference;

        do {

            reference =
                "RSK" +
                UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

        } while (
            bookingRepository
                .findByBookingReference(reference)
                .isPresent()
        );

        booking.setBookingReference(reference);

        return bookingRepository.save(booking);
    }

    private String getRequestedSeats(
        String passengerDetails
    ) {

        if (
            passengerDetails == null ||
            passengerDetails.trim().isEmpty()
        ) {
            return "";
        }

        try {

            JsonNode root =
                objectMapper.readTree(
                    passengerDetails
                );

            JsonNode value =
                root.get("selectedSeats");

            if (
                value != null &&
                value.isArray()
            ) {

                StringBuilder result =
                    new StringBuilder();

                for (JsonNode node : value) {

                    if (result.length() > 0) {
                        result.append(",");
                    }

                    result.append(
                        node.asText()
                    );
                }

                return result.toString();
            }

            JsonNode seatValue =
                root.get("seatNumbers");

            if (
                seatValue != null &&
                seatValue.isTextual()
            ) {
                return seatValue.asText();
            }

        } catch (Exception ignored) {
        }

        return "";
    }

    private String updateBookingDetails(
        String passengerDetails,
        String travelClass,
        String seats,
        String paymentType,
        double amountPaid,
        double remainingAmount
    ) {

        try {

            com.fasterxml.jackson.databind.node.ObjectNode root;

            if (
                passengerDetails == null ||
                passengerDetails.trim().isEmpty()
            ) {

                root =
                    objectMapper
                        .createObjectNode();

            } else {

                JsonNode parsed =
                    objectMapper.readTree(
                        passengerDetails
                    );

                if (!parsed.isObject()) {
                    throw new RuntimeException(
                        "Passenger details must be an object"
                    );
                }

                root =
                    (com.fasterxml.jackson.databind.node.ObjectNode)
                        parsed;
            }

            root.put(
                "travelClass",
                travelClass
            );

            root.put(
                "seatNumbers",
                seats
            );

            root.put(
                "paymentType",
                paymentType
            );

            root.put(
                "amountPaid",
                amountPaid
            );

            root.put(
                "remainingAmount",
                remainingAmount
            );

            return objectMapper
                .writeValueAsString(root);

        } catch (Exception e) {

            throw new RuntimeException(
                "Invalid passenger details"
            );
        }
    }

    private String getRequestedTravelClass(
        String passengerDetails
    ) {

        if (
            passengerDetails == null ||
            passengerDetails.trim().isEmpty()
        ) {
            return null;
        }

        try {

            JsonNode root =
                objectMapper.readTree(
                    passengerDetails
                );

            JsonNode value =
                root.get("travelClass");

            return value == null
                ? null
                : value.asText();

        } catch (Exception e) {
            return null;
        }
    }

    private String getPaymentType(
        String passengerDetails
    ) {

        if (
            passengerDetails == null ||
            passengerDetails.trim().isEmpty()
        ) {
            return "FULL";
        }

        try {

            JsonNode root =
                objectMapper.readTree(
                    passengerDetails
                );

            JsonNode value =
                root.get("paymentType");

            if (
                value != null &&
                "HALF".equalsIgnoreCase(
                    value.asText()
                )
            ) {
                return "HALF";
            }

        } catch (Exception ignored) {
        }

        return "FULL";
    }

    private double getServicePrice(
        String bookingType,
        Long serviceId
    ) {

        switch (bookingType) {

            case "FLIGHT":

                Flight flight =
                    flightService.getFlightById(
                        serviceId
                    );

                if (flight == null) {
                    throw new RuntimeException(
                        "Flight not found"
                    );
                }

                return safePrice(
                    flight.getPrice()
                );

            case "TRAIN":

                Train train =
                    trainService.getTrainById(
                        serviceId
                    );

                if (train == null) {
                    throw new RuntimeException(
                        "Train not found"
                    );
                }

                return safePrice(
                    train.getPrice()
                );

            case "BUS":

                Bus bus =
                    busService.getBusById(
                        serviceId
                    );

                if (bus == null) {
                    throw new RuntimeException(
                        "Bus not found"
                    );
                }

                return safePrice(
                    bus.getPrice()
                );

            default:
                throw new RuntimeException(
                    "Invalid booking type"
                );
        }
    }

    private double safePrice(Double value) {

        if (value == null || value < 0) {
            throw new RuntimeException(
                "Invalid service price"
            );
        }

        return value;
    }

    private String normalizeTravelClass(
        String bookingType,
        String travelClass
    ) {

        if (
            travelClass == null ||
            travelClass.trim().isEmpty()
        ) {

            if ("FLIGHT".equals(bookingType)) {
                return "Economy";
            }

            if ("TRAIN".equals(bookingType)) {
                return "Sleeper";
            }

            return "AC Seater";
        }

        String value =
            travelClass.trim();

        if ("FLIGHT".equals(bookingType)) {

            switch (value) {

                case "Economy":
                case "Premium Economy":
                case "Business":
                case "First":
                    return value;

                default:
                    return "Economy";
            }
        }

        if ("TRAIN".equals(bookingType)) {

            switch (value) {

                case "Sleeper":
                case "General":
                case "Chair Car":
                case "AC 3 Tier":
                case "AC 2 Tier":
                case "First AC":
                    return value;

                default:
                    return "Sleeper";
            }
        }

        switch (value) {

            case "AC Seater":
            case "Seater":
            case "Sleeper":
            case "AC Sleeper":
            case "Volvo":
                return value;

            default:
                return "AC Seater";
        }
    }

    private double getClassMultiplier(
        String bookingType,
        String travelClass
    ) {

        if ("FLIGHT".equals(bookingType)) {

            switch (travelClass) {

                case "Premium Economy":
                    return 1.35;

                case "Business":
                    return 2.50;

                case "First":
                    return 4.00;

                default:
                    return 1.00;
            }
        }

        if ("TRAIN".equals(bookingType)) {

            switch (travelClass) {

                case "General":
                    return 0.65;

                case "Chair Car":
                    return 1.10;

                case "AC 3 Tier":
                    return 1.25;

                case "AC 2 Tier":
                    return 1.65;

                case "First AC":
                    return 2.20;

                default:
                    return 1.00;
            }
        }

        if ("BUS".equals(bookingType)) {

            switch (travelClass) {

                case "Seater":
                    return 0.90;

                case "Sleeper":
                    return 1.20;

                case "AC Sleeper":
                    return 1.55;

                case "Volvo":
                    return 1.80;

                default:
                    return 1.00;
            }
        }

        return 1.00;
    }

    @Transactional
    public Booking cancelBooking(
        Long bookingId,
        User user
    ) {

        if (user == null) {
            throw new RuntimeException(
                "User is required"
            );
        }

        Booking booking =
            bookingRepository.findById(
                bookingId
            ).orElseThrow(
                () -> new RuntimeException(
                    "Booking not found"
                )
            );

        if (
            booking.getUser() == null ||
            booking.getUser().getId() == null ||
            user.getId() == null ||
            !booking.getUser()
                .getId()
                .equals(user.getId())
        ) {

            throw new RuntimeException(
                "You are not allowed to cancel this booking"
            );
        }

        if (
            "CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus()
            )
        ) {

            throw new RuntimeException(
                "Booking is already cancelled"
            );
        }

        /*
         * DO NOT restore service availableSeats.
         *
         * Seat occupancy is derived from active bookings.
         * Once cancelled, the seat automatically becomes
         * available for that journey date.
         */
        booking.setBookingStatus("CANCELLED");

        if (
            "COMPLETED".equalsIgnoreCase(
                booking.getPaymentStatus()
            ) ||
            "PARTIAL".equalsIgnoreCase(
                booking.getPaymentStatus()
            )
        ) {

            booking.setPaymentStatus(
                "REFUND_PENDING"
            );

            booking.setRefundStatus("PENDING");
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateRefundStatus(
        Long bookingId,
        String refundStatus
    ) {

        Booking booking =
            bookingRepository.findById(
                bookingId
            ).orElseThrow(
                () -> new RuntimeException(
                    "Booking not found"
                )
            );

        if (
            !"CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus()
            )
        ) {
            throw new RuntimeException(
                "Refund can only be processed for cancelled bookings"
            );
        }

        if (
            refundStatus == null ||
            refundStatus.trim().isEmpty()
        ) {
            throw new RuntimeException(
                "Refund status is required"
            );
        }

        String normalized =
            refundStatus
                .trim()
                .toUpperCase()
                .replace(" ", "_");

        booking.setRefundStatus(normalized);

        switch (normalized) {

            case "PENDING":
                booking.setPaymentStatus(
                    "REFUND_PENDING"
                );
                break;

            case "PROCESSING":
                booking.setPaymentStatus(
                    "REFUND_PROCESSING"
                );
                break;

            case "COMPLETED":
            case "REFUNDED":
                booking.setPaymentStatus(
                    "REFUNDED"
                );
                break;

            case "REJECTED":
                booking.setPaymentStatus(
                    "REFUND_REJECTED"
                );
                break;

            default:
                throw new RuntimeException(
                    "Invalid refund status"
                );
        }

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(
        User user
    ) {

        if (user == null) {
            throw new RuntimeException(
                "User is required"
            );
        }

        return bookingRepository
            .findByUserOrderByBookingDateDesc(
                user
            );
    }

    public Booking getBookingByReference(
        String reference
    ) {

        if (
            reference == null ||
            reference.trim().isEmpty()
        ) {
            throw new RuntimeException(
                "Booking reference is required"
            );
        }

        return bookingRepository
            .findByBookingReference(
                reference.trim()
            )
            .orElseThrow(
                () -> new RuntimeException(
                    "Booking not found"
                )
            );
    }

    public List<Booking> getAllBookings() {
        return bookingRepository
            .findAllByOrderByBookingDateDesc();
    }

    public long getTotalBookings() {
        return bookingRepository.count();
    }

    public long getConfirmedBookings() {

        return bookingRepository
            .findAll()
            .stream()
            .filter(
                booking ->
                    !"CANCELLED"
                        .equalsIgnoreCase(
                            booking.getBookingStatus()
                        )
            )
            .count();
    }

    public long getCancelledBookings() {

        return bookingRepository
            .findAll()
            .stream()
            .filter(
                booking ->
                    "CANCELLED"
                        .equalsIgnoreCase(
                            booking.getBookingStatus()
                        )
            )
            .count();
    }

    public double getTotalRevenue() {

        return bookingRepository
            .findAll()
            .stream()
            .filter(
                booking ->
                    !"CANCELLED"
                        .equalsIgnoreCase(
                            booking.getBookingStatus()
                        )
            )
            .mapToDouble(
                this::getAmountPaid
            )
            .sum();
    }

    private double getAmountPaid(
        Booking booking
    ) {

        try {

            if (
                booking.getPassengerDetails() != null
            ) {

                JsonNode root =
                    objectMapper.readTree(
                        booking.getPassengerDetails()
                    );

                JsonNode amountPaid =
                    root.get("amountPaid");

                if (
                    amountPaid != null &&
                    amountPaid.isNumber()
                ) {
                    return amountPaid.doubleValue();
                }
            }

        } catch (Exception ignored) {
        }

        return booking.getTotalAmount() != null
            ? booking.getTotalAmount()
            : 0.0;
    }
}
