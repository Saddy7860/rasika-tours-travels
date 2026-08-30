package com.rasika.tours.repository;

import com.rasika.tours.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    List<Flight> findByFromCityAndToCityAndDepartureTimeBetween(
        String fromCity, String toCity, LocalDateTime start, LocalDateTime end);
    List<Flight> findByActiveTrue();
}
