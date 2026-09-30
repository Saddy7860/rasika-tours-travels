package com.rasika.tours.service;

import com.rasika.tours.model.Train;
import com.rasika.tours.repository.TrainRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrainService {

    @Autowired
    private TrainRepository trainRepository;

    public List<Train> searchTrains(String from, String to, LocalDateTime date) {
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return trainRepository
                .findByFromStationAndToStationAndDepartureTimeBetween(
                        from, to, startOfDay, endOfDay);
    }

    public List<Train> getAllActiveTrains() {
        return trainRepository.findByActiveTrue();
    }

    public Train getTrainById(Long id) {
        return trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found"));
    }

    public Train saveTrain(Train train) {
        return trainRepository.save(train);
    }

    public void updateAvailableSeats(Long trainId, Integer seats) {

        Train train = getTrainById(trainId);

        if (train.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough train seats available");
        }

        train.setAvailableSeats(
                train.getAvailableSeats() - seats
        );

        trainRepository.save(train);
    }

    public void restoreSeats(Long trainId, Integer seats) {

        Train train = getTrainById(trainId);

        train.setAvailableSeats(
                train.getAvailableSeats() + seats
        );

        trainRepository.save(train);
    }

    public void deleteTrain(Long id) {
        trainRepository.deleteById(id);
    }
}
