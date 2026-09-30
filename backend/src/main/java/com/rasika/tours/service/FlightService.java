package com.rasika.tours.service;

import com.rasika.tours.model.Flight;
import com.rasika.tours.repository.FlightRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepository;

    public List<Flight> searchFlights(String from, String to, LocalDateTime date) {
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return flightRepository
                .findByFromCityAndToCityAndDepartureTimeBetween(
                        from, to, startOfDay, endOfDay);
    }

    public List<Flight> getAllActiveFlights() {
        return flightRepository.findByActiveTrue();
    }

    public Flight getFlightById(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
    }

    public Flight saveFlight(Flight flight) {
        return flightRepository.save(flight);
    }

    public void updateAvailableSeats(Long flightId, Integer seats) {

        Flight flight = getFlightById(flightId);

        if (flight.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough flight seats available");
        }

        flight.setAvailableSeats(
                flight.getAvailableSeats() - seats
        );

        flightRepository.save(flight);
    }

    public void restoreSeats(Long flightId, Integer seats) {

        Flight flight = getFlightById(flightId);

        flight.setAvailableSeats(
                flight.getAvailableSeats() + seats
        );

        flightRepository.save(flight);
    }

    public void deleteFlight(Long id) {
        flightRepository.deleteById(id);
    }
}
