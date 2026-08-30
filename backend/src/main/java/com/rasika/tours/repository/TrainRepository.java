package com.rasika.tours.repository;

import com.rasika.tours.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {
    List<Train> findByFromStationAndToStationAndDepartureTimeBetween(
        String fromStation, String toStation, LocalDateTime start, LocalDateTime end);
    List<Train> findByActiveTrue();
}
