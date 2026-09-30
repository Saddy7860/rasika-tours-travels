package com.rasika.tours.service;

import java.time.LocalDate;
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

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public Booking createBooking(Booking booking, User user) {

                if (booking.getJourneyDate() == null) {
            booking.setJourneyDate(LocalDate.now());
        }

        if (booking.getJourneyDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Journey date cannot be in the past");
        }

if (user == null) {
            throw new RuntimeException("User is required");
        }

        if (booking == null) {
            throw new RuntimeException("Booking details are required");
        }

        if (booking.getBookingType() == null ||
            booking.getBookingType().trim().isEmpty()) {
            throw new RuntimeException("Booking type is required");
        }

        if (booking.getServiceId() == null) {
            throw new RuntimeException("Service is required");
        }

        if (booking.getNumberOfPassengers() == null ||
            booking.getNumberOfPassengers() <= 0) {
            throw new RuntimeException("Invalid number of passengers");
        }

        if (booking.getNumberOfPassengers() > 50) {
            throw new RuntimeException("Maximum 10 passengers can be booked at once");
        }

        String bookingType = booking.getBookingType().trim().toUpperCase();

        booking.setBookingType(bookingType);
        booking.setUser(user);

        /*
         * Never trust price/status values sent by the frontend.
         * The actual service price is fetched from the database.
         */
        double basePricePerPassenger = getServicePrice(
            bookingType,
            booking.getServiceId()
        );

        String requestedClassForPricing =
            normalizeTravelClass(
                bookingType,
                getRequestedTravelClass(booking.getPassengerDetails())
            );

        double pricePerPassenger =
            basePricePerPassenger *
            getClassMultiplier(
                bookingType,
                requestedClassForPricing
            );

        validateAvailableSeats(
            bookingType,
            booking.getServiceId(),
            booking.getNumberOfPassengers()
        );

        double totalAmount =
            pricePerPassenger * booking.getNumberOfPassengers();

        /*
         * Determine payment type from passengerDetails.
         * FULL = complete payment
         * HALF = 50% payment
         */
        String paymentType = getPaymentType(booking.getPassengerDetails());

        double amountPaid;

        if ("HALF".equals(paymentType)) {
            amountPaid = Math.ceil(totalAmount / 2.0);
        } else {
            paymentType = "FULL";
            amountPaid = totalAmount;
        }

        double remainingAmount = totalAmount - amountPaid;

        /*
         * Store server-calculated values.
         */
        booking.setTotalAmount(totalAmount);
        booking.setPaymentStatus(
            amountPaid >= totalAmount ? "COMPLETED" : "PARTIAL"
        );
        booking.setBookingStatus("CONFIRMED");
        booking.setRefundStatus(null);

        String selectedClass = normalizeTravelClass(
            bookingType,
            getRequestedTravelClass(booking.getPassengerDetails())
        );

        booking.setTravelClass(selectedClass);

        booking.setSeatNumbers(
            assignSeatNumbers(
                bookingType,
                booking.getServiceId(),
                selectedClass,
                booking.getNumberOfPassengers()
            )
        );

        /*
         * Update passenger details with trusted payment values.
         */
        booking.setPassengerDetails(
            updatePaymentDetails(
                booking.getPassengerDetails(),
                paymentType,
                amountPaid,
                remainingAmount
            )
        );

        /*
         * Generate a unique booking reference.
         */
        String reference;

        do {
            reference =
                "RSK" +
                UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();
        } while (
            bookingRepository.findByBookingReference(reference).isPresent()
        );

        booking.setBookingReference(reference);

        /*
         * Reduce available seats only after all validation succeeds.
         */
        switch (bookingType) {

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


    private String getRequestedTravelClass(String passengerDetails) {
        if (passengerDetails == null || passengerDetails.trim().isEmpty()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(passengerDetails);
            JsonNode value = root.get("travelClass");

            if (value != null && !value.asText().trim().isEmpty()) {
                return value.asText().trim();
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    private String normalizeTravelClass(String bookingType, String requested) {

        String value = requested == null
            ? ""
            : requested.trim().toUpperCase();

        switch (bookingType) {

            case "FLIGHT":
                if (value.equals("PREMIUM ECONOMY")) return "Premium Economy";
                if (value.equals("BUSINESS")) return "Business";
                if (value.equals("FIRST")) return "First";
                return "Economy";

            case "TRAIN":
                if (value.equals("GENERAL")) return "General";
                if (value.equals("AC 3 TIER")) return "AC 3 Tier";
                if (value.equals("AC 2 TIER")) return "AC 2 Tier";
                if (value.equals("FIRST AC")) return "First AC";
                if (value.equals("CHAIR CAR")) return "Chair Car";
                return "Sleeper";

            case "BUS":
                if (value.equals("SEATER")) return "Seater";
                if (value.equals("AC SEATER")) return "AC Seater";
                if (value.equals("SLEEPER")) return "Sleeper";
                if (value.equals("AC SLEEPER")) return "AC Sleeper";
                if (value.equals("VOLVO")) return "Volvo";
                return "AC Seater";

            default:
                return requested == null || requested.trim().isEmpty()
                    ? "Standard"
                    : requested.trim();
        }
    }

    private double getClassMultiplier(String bookingType, String travelClass) {

        if (bookingType.equals("FLIGHT")) {
            switch (travelClass) {
                case "Premium Economy": return 1.35;
                case "Business": return 2.50;
                case "First": return 4.00;
                default: return 1.00;
            }
        }

        if (bookingType.equals("TRAIN")) {
            switch (travelClass) {
                case "General": return 0.65;
                case "AC 3 Tier": return 1.25;
                case "AC 2 Tier": return 1.65;
                case "First AC": return 2.20;
                case "Chair Car": return 1.10;
                default: return 1.00;
            }
        }

        if (bookingType.equals("BUS")) {
            switch (travelClass) {
                case "Seater": return 0.90;
                case "Sleeper": return 1.20;
                case "AC Sleeper": return 1.55;
                case "Volvo": return 1.80;
                default: return 1.00;
            }
        }

        return 1.00;
    }

    private String assignSeatNumbers(
        String bookingType,
        Long serviceId,
        String travelClass,
        Integer passengers
    ) {

        List<Booking> occupiedBookings =
            bookingRepository
                .findByBookingTypeAndServiceIdAndBookingStatusNot(
                    bookingType,
                    serviceId,
                    "CANCELLED"
                );

        java.util.Set<Integer> occupied = new java.util.HashSet<>();

        for (Booking existing : occupiedBookings) {

            if (existing.getSeatNumbers() == null) {
                continue;
            }

            String[] seats =
                existing.getSeatNumbers().split(",");

            for (String seat : seats) {

                String digits =
                    seat.replaceAll("[^0-9]", "");

                if (!digits.isEmpty()) {
                    try {
                        occupied.add(Integer.parseInt(digits));
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }

        StringBuilder result = new StringBuilder();
        int found = 0;
        int candidate = 1;

        while (found < passengers) {

            if (!occupied.contains(candidate)) {

                if (result.length() > 0) {
                    result.append(", ");
                }

                result.append(buildSeatLabel(
                    bookingType,
                    travelClass,
                    candidate
                ));

                found++;
            }

            candidate++;

            if (candidate > 1000) {
                throw new RuntimeException(
                    "Unable to allocate seats"
                );
            }
        }

        return result.toString();
    }

    private String buildSeatLabel(
        String bookingType,
        String travelClass,
        int number
    ) {

        String n = String.format("%02d", number);

        if ("FLIGHT".equals(bookingType)) {

            switch (travelClass) {
                case "Premium Economy":
                    return "PE" + n;
                case "Business":
                    return "B" + n;
                case "First":
                    return "F" + n;
                default:
                    return "E" + n;
            }
        }

        if ("TRAIN".equals(bookingType)) {

            switch (travelClass) {
                case "General":
                    return "GEN-" + n;
                case "AC 3 Tier":
                    return "3A-" + n;
                case "AC 2 Tier":
                    return "2A-" + n;
                case "First AC":
                    return "1A-" + n;
                case "Chair Car":
                    return "CC-" + n;
                default:
                    return "SL-" + n;
            }
        }

        if ("BUS".equals(bookingType)) {

            switch (travelClass) {
                case "Sleeper":
                    return "SL-" + n;
                case "AC Sleeper":
                    return "AS-" + n;
                case "Volvo":
                    return "V-" + n;
                case "Seater":
                    return "S-" + n;
                default:
                    return "A-" + n;
            }
        }

        return "S-" + n;
    }

    private double getServicePrice(String bookingType, Long serviceId) {

        switch (bookingType) {

            case "FLIGHT":
                Flight flight = flightService.getFlightById(serviceId);

                if (flight == null) {
                    throw new RuntimeException("Flight not found");
                }

                return flight.getPrice();

            case "TRAIN":
                Train train = trainService.getTrainById(serviceId);

                if (train == null) {
                    throw new RuntimeException("Train not found");
                }

                return train.getPrice();

            case "BUS":
                Bus bus = busService.getBusById(serviceId);

                if (bus == null) {
                    throw new RuntimeException("Bus not found");
                }

                return bus.getPrice();

            default:
                throw new RuntimeException("Invalid booking type");
        }
    }

    private void validateAvailableSeats(
        String bookingType,
        Long serviceId,
        Integer passengers
    ) {

        switch (bookingType) {

            case "FLIGHT":

                Flight flight = flightService.getFlightById(serviceId);

                if (flight == null) {
                    throw new RuntimeException("Flight not found");
                }

                if (flight.getAvailableSeats() < passengers) {
                    throw new RuntimeException("Not enough seats available");
                }

                break;

            case "TRAIN":

                Train train = trainService.getTrainById(serviceId);

                if (train == null) {
                    throw new RuntimeException("Train not found");
                }

                if (train.getAvailableSeats() < passengers) {
                    throw new RuntimeException("Not enough seats available");
                }

                break;

            case "BUS":

                Bus bus = busService.getBusById(serviceId);

                if (bus == null) {
                    throw new RuntimeException("Bus not found");
                }

                if (bus.getAvailableSeats() < passengers) {
                    throw new RuntimeException("Not enough seats available");
                }

                break;

            default:
                throw new RuntimeException("Invalid booking type");
        }
    }

    private String getPaymentType(String passengerDetails) {

        if (passengerDetails == null ||
            passengerDetails.trim().isEmpty()) {
            return "FULL";
        }

        try {
            JsonNode root =
                objectMapper.readTree(passengerDetails);

            JsonNode paymentType =
                root.get("paymentType");

            if (paymentType != null &&
                "HALF".equalsIgnoreCase(paymentType.asText())) {
                return "HALF";
            }

        } catch (Exception ignored) {
            /*
             * Invalid/missing payment metadata defaults to FULL.
             */
        }

        return "FULL";
    }

    private String updatePaymentDetails(
        String passengerDetails,
        String paymentType,
        double amountPaid,
        double remainingAmount
    ) {

        try {

            JsonNode root;

            if (passengerDetails == null ||
                passengerDetails.trim().isEmpty()) {

                root = objectMapper.createObjectNode();

            } else {

                root = objectMapper.readTree(passengerDetails);

                if (!root.isObject()) {
                    root = objectMapper.createObjectNode();
                }
            }

            ((com.fasterxml.jackson.databind.node.ObjectNode) root)
                .put("paymentType", paymentType)
                .put("amountPaid", amountPaid)
                .put("remainingAmount", remainingAmount);

            return objectMapper.writeValueAsString(root);

        } catch (Exception e) {

            throw new RuntimeException(
                "Invalid passenger details"
            );
        }
    }

    public List<Booking> getUserBookings(User user) {

        if (user == null) {
            throw new RuntimeException("User is required");
        }

        return bookingRepository.findByUserOrderByBookingDateDesc(user);
    }

    public Booking getBookingByReference(String reference) {

        if (reference == null ||
            reference.trim().isEmpty()) {
            throw new RuntimeException("Booking reference is required");
        }

        return bookingRepository
            .findByBookingReference(reference.trim())
            .orElseThrow(
                () -> new RuntimeException("Booking not found")
            );
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, User user) {

        if (user == null) {
            throw new RuntimeException("User is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(
                () -> new RuntimeException("Booking not found")
            );

        /*
         * Critical security check:
         * a customer can cancel ONLY their own booking.
         */
        if (booking.getUser() == null ||
            booking.getUser().getId() == null ||
            user.getId() == null ||
            !booking.getUser().getId().equals(user.getId())) {

            throw new RuntimeException(
                "You are not allowed to cancel this booking"
            );
        }

        if ("CANCELLED".equalsIgnoreCase(
            booking.getBookingStatus()
        )) {

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
            booking.getPaymentStatus()
        ) ||
        "PARTIAL".equalsIgnoreCase(
            booking.getPaymentStatus()
        )) {

            booking.setPaymentStatus("REFUND_PENDING");
            booking.setRefundStatus("PENDING");
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateRefundStatus(
        Long bookingId,
        String refundStatus
    ) {

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(
                () -> new RuntimeException("Booking not found")
            );

        if (!"CANCELLED".equalsIgnoreCase(
            booking.getBookingStatus()
        )) {

            throw new RuntimeException(
                "Refund can only be processed for cancelled bookings"
            );
        }

        if (refundStatus == null ||
            refundStatus.trim().isEmpty()) {

            throw new RuntimeException(
                "Refund status is required"
            );
        }

        String normalizedStatus =
            refundStatus
                .trim()
                .toUpperCase()
                .replace(" ", "_");

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

                throw new RuntimeException(
                    "Invalid refund status"
                );
        }

        return bookingRepository.save(booking);
    }

    private void restoreSeats(
        String bookingType,
        Long serviceId,
        Integer passengers
    ) {

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

            default:

                throw new RuntimeException(
                    "Invalid booking type"
                );
        }
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingDateDesc();
    }

    public long getTotalBookings() {
        return bookingRepository.count();
    }

    public long getConfirmedBookings() {

        return bookingRepository.findAll()
            .stream()
            .filter(
                booking ->
                    !"CANCELLED".equalsIgnoreCase(
                        booking.getBookingStatus()
                    )
            )
            .count();
    }

    public long getCancelledBookings() {

        return bookingRepository.findAll()
            .stream()
            .filter(
                booking ->
                    "CANCELLED".equalsIgnoreCase(
                        booking.getBookingStatus()
                    )
            )
            .count();
    }

    public double getTotalRevenue() {

        return bookingRepository.findAll()
            .stream()
            .filter(
                booking ->
                    !"CANCELLED".equalsIgnoreCase(
                        booking.getBookingStatus()
                    )
            )
            .mapToDouble(this::getAmountPaid)
            .sum();
    }

    private double getAmountPaid(Booking booking) {

        /*
         * Prefer the actual amountPaid stored in passengerDetails.
         */
        try {

            if (booking.getPassengerDetails() != null) {

                JsonNode root =
                    objectMapper.readTree(
                        booking.getPassengerDetails()
                    );

                JsonNode amountPaid =
                    root.get("amountPaid");

                if (amountPaid != null &&
                    amountPaid.isNumber()) {

                    return amountPaid.doubleValue();
                }
            }

        } catch (Exception ignored) {
        }

        /*
         * Fallback for older bookings.
         */
        return booking.getTotalAmount() != null
            ? booking.getTotalAmount()
            : 0.0;
    }
}
