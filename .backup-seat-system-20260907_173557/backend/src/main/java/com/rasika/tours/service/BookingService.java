package com.rasika.tours.service;

import java.time.LocalDate;
import java.util.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
    @Autowired private BookingRepository bookingRepository;
    @Autowired private FlightService flightService;
    @Autowired private TrainService trainService;
    @Autowired private BusService busService;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private SeatConfigurationService seatConfigurationService;

    @Transactional
    public synchronized Booking createBooking(Booking booking, User user) {
        if (booking == null) throw new RuntimeException("Booking details are required");
        if (user == null) throw new RuntimeException("User is required");

        if (booking.getJourneyDate() == null) booking.setJourneyDate(LocalDate.now());
        if (booking.getJourneyDate().isBefore(LocalDate.now()))
            throw new RuntimeException("Journey date cannot be in the past");

        String bookingType = booking.getBookingType() == null ? "" : booking.getBookingType().trim().toUpperCase();
        if (bookingType.isEmpty()) throw new RuntimeException("Booking type is required");
        if (booking.getServiceId() == null) throw new RuntimeException("Service is required");
        if (booking.getNumberOfPassengers() == null || booking.getNumberOfPassengers() <= 0)
            throw new RuntimeException("Invalid number of passengers");
        if (booking.getNumberOfPassengers() > 50)
            throw new RuntimeException("Maximum 50 passengers can be booked at once");

        booking.setBookingType(bookingType);
        booking.setUser(user);

        double basePrice = getServicePrice(bookingType, booking.getServiceId());
        String selectedClass = normalizeTravelClass(bookingType, getRequestedTravelClass(booking.getPassengerDetails()));
        double pricePerPassenger = basePrice * getClassMultiplier(bookingType, selectedClass);
        double totalAmount = Math.round(pricePerPassenger * booking.getNumberOfPassengers() * 100.0) / 100.0;

        String requestedSeats = getRequestedSeats(booking.getPassengerDetails());
        List<String> seats = seatConfigurationService.validateOrAllocate(
            bookingType,
            booking.getServiceId(),
            booking.getJourneyDate(),
            requestedSeats,
            booking.getNumberOfPassengers()
        );

        String paymentType = getPaymentType(booking.getPassengerDetails());
        double amountPaid = "HALF".equals(paymentType) ? Math.ceil(totalAmount / 2.0) : totalAmount;
        double remainingAmount = Math.round((totalAmount - amountPaid) * 100.0) / 100.0;

        booking.setTotalAmount(totalAmount);
        booking.setPaymentStatus(amountPaid >= totalAmount ? "COMPLETED" : "PARTIAL");
        booking.setBookingStatus("CONFIRMED");
        booking.setRefundStatus(null);
        booking.setTravelClass(selectedClass);
        booking.setSeatNumbers(String.join(", ", seats));
        booking.setPassengerDetails(updateBookingDetails(
            booking.getPassengerDetails(), paymentType, amountPaid, remainingAmount, selectedClass, seats
        ));

        String reference;
        do {
            reference = "RSK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (bookingRepository.findByBookingReference(reference).isPresent());
        booking.setBookingReference(reference);

        // Seat inventory is date-specific. Do not mutate the service's global availableSeats.
        return bookingRepository.save(booking);
    }

    private String getRequestedSeats(String details) {
        if (details == null || details.trim().isEmpty()) return null;
        try {
            JsonNode root = objectMapper.readTree(details);
            JsonNode value = root.get("selectedSeats");
            if (value == null) return null;
            if (value.isArray()) {
                List<String> result = new ArrayList<>();
                value.forEach(n -> {
                    String s = n.asText("").trim();
                    if (!s.isEmpty()) result.add(s);
                });
                return String.join(",", result);
            }
            String text = value.asText("").trim();
            return text.isEmpty() ? null : text;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String getRequestedTravelClass(String details) {
        if (details == null || details.trim().isEmpty()) return null;
        try {
            JsonNode root = objectMapper.readTree(details);
            JsonNode value = root.get("travelClass");
            return value != null && !value.asText().trim().isEmpty() ? value.asText().trim() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String normalizeTravelClass(String type, String requested) {
        String value = requested == null ? "" : requested.trim().toUpperCase();
        switch (type) {
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
                return requested == null || requested.trim().isEmpty() ? "Standard" : requested.trim();
        }
    }

    private double getClassMultiplier(String type, String travelClass) {
        if ("FLIGHT".equals(type)) {
            switch (travelClass) {
                case "Premium Economy": return 1.35;
                case "Business": return 2.50;
                case "First": return 4.00;
                default: return 1.00;
            }
        }
        if ("TRAIN".equals(type)) {
            switch (travelClass) {
                case "General": return 0.65;
                case "AC 3 Tier": return 1.25;
                case "AC 2 Tier": return 1.65;
                case "First AC": return 2.20;
                case "Chair Car": return 1.10;
                default: return 1.00;
            }
        }
        if ("BUS".equals(type)) {
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

    private double getServicePrice(String type, Long id) {
        switch (type) {
            case "FLIGHT":
                Flight flight = flightService.getFlightById(id);
                return flight.getPrice();
            case "TRAIN":
                Train train = trainService.getTrainById(id);
                return train.getPrice();
            case "BUS":
                Bus bus = busService.getBusById(id);
                return bus.getPrice();
            default: throw new RuntimeException("Invalid booking type");
        }
    }

    private String getPaymentType(String details) {
        if (details == null || details.trim().isEmpty()) return "FULL";
        try {
            JsonNode root = objectMapper.readTree(details);
            JsonNode paymentType = root.get("paymentType");
            if (paymentType != null && "HALF".equalsIgnoreCase(paymentType.asText())) return "HALF";
        } catch (Exception ignored) {}
        return "FULL";
    }

    private String updateBookingDetails(String details, String paymentType, double paid,
                                         double remaining, String travelClass, List<String> seats) {
        try {
            JsonNode root;
            if (details == null || details.trim().isEmpty()) root = objectMapper.createObjectNode();
            else {
                root = objectMapper.readTree(details);
                if (!root.isObject()) root = objectMapper.createObjectNode();
            }
            ObjectNode obj = (ObjectNode) root;
            obj.put("paymentType", paymentType);
            obj.put("amountPaid", paid);
            obj.put("remainingAmount", remaining);
            obj.put("travelClass", travelClass);
            var array = objectMapper.createArrayNode();
            seats.forEach(array::add);
            obj.set("selectedSeats", array);
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Invalid passenger details");
        }
    }

    public List<Booking> getUserBookings(User user) {
        if (user == null) throw new RuntimeException("User is required");
        return bookingRepository.findByUserOrderByBookingDateDesc(user);
    }

    public Booking getBookingByReference(String reference) {
        if (reference == null || reference.trim().isEmpty()) throw new RuntimeException("Booking reference is required");
        return bookingRepository.findByBookingReference(reference.trim())
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Transactional
    public Booking cancelBooking(Long id, User user) {
        if (user == null) throw new RuntimeException("User is required");
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getUser() == null || booking.getUser().getId() == null || user.getId() == null ||
            !booking.getUser().getId().equals(user.getId()))
            throw new RuntimeException("You are not allowed to cancel this booking");
        if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus()))
            throw new RuntimeException("Booking is already cancelled");

        booking.setBookingStatus("CANCELLED");
        if ("COMPLETED".equalsIgnoreCase(booking.getPaymentStatus()) ||
            "PARTIAL".equalsIgnoreCase(booking.getPaymentStatus())) {
            booking.setPaymentStatus("REFUND_PENDING");
            booking.setRefundStatus("PENDING");
        }
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateRefundStatus(Long id, String refundStatus) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!"CANCELLED".equalsIgnoreCase(booking.getBookingStatus()))
            throw new RuntimeException("Refund can only be processed for cancelled bookings");
        if (refundStatus == null || refundStatus.trim().isEmpty())
            throw new RuntimeException("Refund status is required");

        String status = refundStatus.trim().toUpperCase().replace(" ", "_");
        booking.setRefundStatus(status);
        switch (status) {
            case "PENDING": booking.setPaymentStatus("REFUND_PENDING"); break;
            case "PROCESSING": case "UNDER_REVIEW": booking.setPaymentStatus("REFUND_PROCESSING"); break;
            case "COMPLETED": case "REFUNDED": booking.setPaymentStatus("REFUNDED"); break;
            case "REJECTED": booking.setPaymentStatus("REFUND_REJECTED"); break;
            default: throw new RuntimeException("Invalid refund status");
        }
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() { return bookingRepository.findAllByOrderByBookingDateDesc(); }
    public long getTotalBookings() { return bookingRepository.count(); }
    public long getConfirmedBookings() {
        return bookingRepository.findAll().stream().filter(b -> !"CANCELLED".equalsIgnoreCase(b.getBookingStatus())).count();
    }
    public long getCancelledBookings() {
        return bookingRepository.findAll().stream().filter(b -> "CANCELLED".equalsIgnoreCase(b.getBookingStatus())).count();
    }
    public double getTotalRevenue() {
        return bookingRepository.findAll().stream()
            .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getBookingStatus()))
            .mapToDouble(this::getAmountPaid).sum();
    }

    private double getAmountPaid(Booking booking) {
        try {
            if (booking.getPassengerDetails() != null) {
                JsonNode root = objectMapper.readTree(booking.getPassengerDetails());
                JsonNode paid = root.get("amountPaid");
                if (paid != null && paid.isNumber()) return paid.doubleValue();
            }
        } catch (Exception ignored) {}
        return booking.getTotalAmount() == null ? 0.0 : booking.getTotalAmount();
    }
}
