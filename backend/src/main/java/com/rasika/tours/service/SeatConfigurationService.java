package com.rasika.tours.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rasika.tours.model.Booking;
import com.rasika.tours.model.Bus;
import com.rasika.tours.model.Flight;
import com.rasika.tours.model.ServiceSeatConfig;
import com.rasika.tours.model.Train;
import com.rasika.tours.repository.BookingRepository;
import com.rasika.tours.repository.ServiceSeatConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class SeatConfigurationService {

    @Autowired
    private ServiceSeatConfigRepository configRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BusService busService;

    @Autowired
    private TrainService trainService;

    @Autowired
    private FlightService flightService;

    @Autowired
    private ObjectMapper objectMapper;

    public ServiceSeatConfig getOrCreate(String type, Long serviceId) {

        String normalized = normalizeType(type);

        Optional<ServiceSeatConfig> existing =
            configRepository.findByBookingTypeAndServiceId(
                normalized,
                serviceId
            );

        if (existing.isPresent()) {
            return existing.get();
        }

        int capacity = getServiceCapacity(normalized, serviceId);

        ServiceSeatConfig config = new ServiceSeatConfig();
        config.setBookingType(normalized);
        config.setServiceId(serviceId);
        config.setSeatCapacity(capacity);
        config.setLayout(defaultLayout(normalized));
        config.setBlockedSeats("");

        return configRepository.save(config);
    }

    @Transactional
    public ServiceSeatConfig saveConfig(
        String type,
        Long serviceId,
        Integer capacity,
        String layout
    ) {

        String normalized = normalizeType(type);

        if (serviceId == null) {
            throw new RuntimeException("Service is required");
        }

        if (capacity == null || capacity < 1 || capacity > 500) {
            throw new RuntimeException("Seat capacity must be between 1 and 500");
        }

        String normalizedLayout = normalizeLayout(layout);

        ServiceSeatConfig config =
            getOrCreate(normalized, serviceId);

        Set<String> oldBlocked =
            parseCsv(config.getBlockedSeats());

        List<String> newSeats =
            buildSeatLabels(capacity);

        oldBlocked.retainAll(new HashSet<>(newSeats));

        config.setSeatCapacity(capacity);
        config.setLayout(normalizedLayout);
        config.setBlockedSeats(String.join(",", oldBlocked));

        return configRepository.save(config);
    }

    @Transactional
    public ServiceSeatConfig setBlocked(
        String type,
        Long serviceId,
        String seatNumber,
        boolean blocked
    ) {

        String normalized = normalizeType(type);

        ServiceSeatConfig config =
            getOrCreate(normalized, serviceId);

        List<String> allSeats =
            buildSeatLabels(config.getSeatCapacity());

        String seat = seatNumber == null
            ? ""
            : seatNumber.trim().toUpperCase();

        if (!allSeats.contains(seat)) {
            throw new RuntimeException("Invalid seat number: " + seat);
        }

        if (blocked && isSeatOccupiedAnywhere(
            normalized,
            serviceId,
            seat,
            config.getSeatCapacity()
        )) {
            throw new RuntimeException(
                "This seat is already occupied by an active booking and cannot be blocked."
            );
        }

        Set<String> blockedSeats =
            parseCsv(config.getBlockedSeats());

        if (blocked) {
            blockedSeats.add(seat);
        } else {
            blockedSeats.remove(seat);
        }

        config.setBlockedSeats(String.join(",", blockedSeats));

        return configRepository.save(config);
    }

    public Map<String, Object> buildSeatMap(
        String type,
        Long serviceId,
        LocalDate journeyDate
    ) {

        if (journeyDate == null) {
            throw new RuntimeException("Journey date is required");
        }

        String normalized = normalizeType(type);

        ServiceSeatConfig config =
            getOrCreate(normalized, serviceId);

        List<String> allSeats =
            buildSeatLabels(config.getSeatCapacity());

        Set<String> blocked =
            parseCsv(config.getBlockedSeats());

        Set<String> occupied =
            getOccupiedSeats(
                normalized,
                serviceId,
                journeyDate,
                allSeats
            );

        List<Map<String, Object>> seats = new ArrayList<>();

        int available = 0;
        int occupiedCount = 0;
        int blockedCount = 0;

        for (String seatNumber : allSeats) {

            String status;

            if (occupied.contains(seatNumber)) {
                status = "OCCUPIED";
                occupiedCount++;
            } else if (blocked.contains(seatNumber)) {
                status = "BLOCKED";
                blockedCount++;
            } else {
                status = "AVAILABLE";
                available++;
            }

            Map<String, Object> seat = new LinkedHashMap<>();
            seat.put("seatNumber", seatNumber);
            seat.put("status", status);

            seats.add(seat);
        }

        Map<String, Object> result =
            new LinkedHashMap<>();

        int columns = getColumns(config.getLayout());

        result.put("bookingType", normalized);
        result.put("serviceId", serviceId);
        result.put("journeyDate", journeyDate);
        result.put("capacity", config.getSeatCapacity());
        result.put("layout", config.getLayout());
        result.put("columns", columns);
        result.put("availableCount", available);
        result.put("occupiedCount", occupiedCount);
        result.put("blockedCount", blockedCount);
        result.put("seats", seats);

        return result;
    }

    public String validateOrAllocateSeats(
        String type,
        Long serviceId,
        LocalDate journeyDate,
        Integer passengers,
        String requestedSeats
    ) {

        if (journeyDate == null) {
            throw new RuntimeException("Journey date is required");
        }

        if (passengers == null || passengers < 1) {
            throw new RuntimeException("Invalid number of passengers");
        }

        ServiceSeatConfig config =
            getOrCreate(normalizeType(type), serviceId);

        List<String> allSeats =
            buildSeatLabels(config.getSeatCapacity());

        Set<String> blocked =
            parseCsv(config.getBlockedSeats());

        Set<String> occupied =
            getOccupiedSeats(
                normalizeType(type),
                serviceId,
                journeyDate,
                allSeats
            );

        Set<String> unavailable =
            new HashSet<>();

        unavailable.addAll(blocked);
        unavailable.addAll(occupied);

        List<String> requested =
            parseRequestedSeats(requestedSeats);

        if (!requested.isEmpty()) {

            if (requested.size() != passengers) {
                throw new RuntimeException(
                    "Please select exactly " +
                    passengers +
                    " seat" +
                    (passengers > 1 ? "s" : "") +
                    "."
                );
            }

            Set<String> unique =
                new LinkedHashSet<>(requested);

            if (unique.size() != requested.size()) {
                throw new RuntimeException(
                    "Duplicate seat selection is not allowed."
                );
            }

            for (String seat : requested) {

                if (!allSeats.contains(seat)) {
                    throw new RuntimeException(
                        "Invalid seat selected: " + seat
                    );
                }

                if (unavailable.contains(seat)) {
                    throw new RuntimeException(
                        "Seat " + seat +
                        " is no longer available. Please select another seat."
                    );
                }
            }

            return String.join(", ", requested);
        }

        List<String> selected = new ArrayList<>();

        for (String seat : allSeats) {

            if (!unavailable.contains(seat)) {
                selected.add(seat);
            }

            if (selected.size() == passengers) {
                break;
            }
        }

        if (selected.size() < passengers) {
            throw new RuntimeException(
                "Only " +
                selected.size() +
                " seats are available for this journey date."
            );
        }

        return String.join(", ", selected);
    }

    private Set<String> getOccupiedSeats(
        String type,
        Long serviceId,
        LocalDate journeyDate,
        List<String> allSeats
    ) {

        List<Booking> bookings =
            bookingRepository
                .findByBookingTypeAndServiceIdAndJourneyDateAndBookingStatusNot(
                    type,
                    serviceId,
                    journeyDate,
                    "CANCELLED"
                );

        Set<String> occupied =
            new HashSet<>();

        for (Booking booking : bookings) {

            if (booking.getSeatNumbers() == null) {
                continue;
            }

            String[] seats =
                booking.getSeatNumbers().split(",");

            for (String raw : seats) {

                String seat =
                    raw.trim().toUpperCase();

                if (seat.isEmpty()) {
                    continue;
                }

                if (allSeats.contains(seat)) {
                    occupied.add(seat);
                    continue;
                }

                // Compatibility with old labels such as E01, B02,
                // SL-03, 3A-04 etc.
                String digits =
                    seat.replaceAll("[^0-9]", "");

                if (!digits.isEmpty()) {

                    try {

                        int oldNumber =
                            Integer.parseInt(digits);

                        if (
                            oldNumber >= 1 &&
                            oldNumber <= allSeats.size()
                        ) {
                            occupied.add(
                                allSeats.get(oldNumber - 1)
                            );
                        }

                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }

        return occupied;
    }

    private boolean isSeatOccupiedAnywhere(
        String type,
        Long serviceId,
        String seat,
        int capacity
    ) {

        List<Booking> bookings =
            bookingRepository
                .findByBookingTypeAndServiceIdAndBookingStatusNot(
                    type,
                    serviceId,
                    "CANCELLED"
                );

        List<String> allSeats =
            buildSeatLabels(capacity);

        for (Booking booking : bookings) {

            if (booking.getSeatNumbers() == null) {
                continue;
            }

            for (String raw :
                booking.getSeatNumbers().split(",")) {

                String current =
                    raw.trim().toUpperCase();

                if (seat.equals(current)) {
                    return true;
                }

                String digits =
                    current.replaceAll("[^0-9]", "");

                if (!digits.isEmpty()) {
                    try {
                        int n = Integer.parseInt(digits);

                        if (
                            n >= 1 &&
                            n <= allSeats.size() &&
                            seat.equals(allSeats.get(n - 1))
                        ) {
                            return true;
                        }
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }

        return false;
    }

    private int getServiceCapacity(
        String type,
        Long serviceId
    ) {

        switch (type) {

            case "BUS":
                Bus bus = busService.getBusById(serviceId);
                if (bus == null) {
                    throw new RuntimeException("Bus not found");
                }
                return safeCapacity(bus.getAvailableSeats());

            case "TRAIN":
                Train train = trainService.getTrainById(serviceId);
                if (train == null) {
                    throw new RuntimeException("Train not found");
                }
                return safeCapacity(train.getAvailableSeats());

            case "FLIGHT":
                Flight flight = flightService.getFlightById(serviceId);
                if (flight == null) {
                    throw new RuntimeException("Flight not found");
                }
                return safeCapacity(flight.getAvailableSeats());

            default:
                throw new RuntimeException("Invalid booking type");
        }
    }

    private int safeCapacity(Integer value) {
        if (value == null || value < 1) {
            return 40;
        }
        return Math.min(value, 500);
    }

    private String defaultLayout(String type) {

        if ("BUS".equals(type)) {
            return "2x2";
        }

        return "2x3";
    }

    private String normalizeType(String type) {

        if (type == null) {
            throw new RuntimeException("Booking type is required");
        }

        String value =
            type.trim().toUpperCase();

        if (
            !"BUS".equals(value) &&
            !"TRAIN".equals(value) &&
            !"FLIGHT".equals(value)
        ) {
            throw new RuntimeException("Invalid booking type");
        }

        return value;
    }

    private String normalizeLayout(String layout) {

        if (layout == null || layout.trim().isEmpty()) {
            return "2x2";
        }

        String value =
            layout.trim().toLowerCase();

        if (!value.matches("[1-9][0-9]*x[1-9][0-9]*")) {
            throw new RuntimeException(
                "Invalid seat layout. Example: 2x2 or 2x3"
            );
        }

        return value;
    }

    private int getColumns(String layout) {

        try {
            return Integer.parseInt(
                layout.substring(
                    layout.indexOf('x') + 1
                )
            );
        } catch (Exception e) {
            return 2;
        }
    }

    private List<String> buildSeatLabels(int capacity) {

        List<String> seats =
            new ArrayList<>();

        int columns = 4;

        for (int i = 1; i <= capacity; i++) {

            int row =
                ((i - 1) / columns) + 1;

            int column =
                ((i - 1) % columns);

            char letter =
                (char) ('A' + column);

            seats.add(
                row + String.valueOf(letter)
            );
        }

        return seats;
    }

    private Set<String> parseCsv(String csv) {

        Set<String> result =
            new LinkedHashSet<>();

        if (csv == null || csv.trim().isEmpty()) {
            return result;
        }

        for (String value : csv.split(",")) {

            String normalized =
                value.trim().toUpperCase();

            if (!normalized.isEmpty()) {
                result.add(normalized);
            }
        }

        return result;
    }

    private List<String> parseRequestedSeats(
        String value
    ) {

        List<String> result =
            new ArrayList<>();

        if (value == null || value.trim().isEmpty()) {
            return result;
        }

        for (String seat : value.split(",")) {

            String normalized =
                seat.trim().toUpperCase();

            if (!normalized.isEmpty()) {
                result.add(normalized);
            }
        }

        return result;
    }
}
