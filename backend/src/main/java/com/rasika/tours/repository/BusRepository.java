package com.rasika.tours.repository;

import com.rasika.tours.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    List<Bus> findByFromCityAndToCityAndDepartureTimeBetween(
        String fromCity, String toCity, LocalDateTime start, LocalDateTime end);
    List<Bus> findByActiveTrue();
}
