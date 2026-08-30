package com.rasika.tours.service;

import com.rasika.tours.model.Bus;
import com.rasika.tours.repository.BusRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepository;

    public List<Bus> searchBuses(String from, String to, LocalDateTime date) {
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return busRepository
                .findByFromCityAndToCityAndDepartureTimeBetween(
                        from, to, startOfDay, endOfDay);
    }

    public List<Bus> getAllActiveBuses() {
        return busRepository.findByActiveTrue();
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found"));
    }

    public Bus saveBus(Bus bus) {
        return busRepository.save(bus);
    }

    public void updateAvailableSeats(Long busId, Integer seats) {

        Bus bus = getBusById(busId);

        if (bus.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough bus seats available");
        }

        bus.setAvailableSeats(
                bus.getAvailableSeats() - seats
        );

        busRepository.save(bus);
    }

    public void restoreSeats(Long busId, Integer seats) {

        Bus bus = getBusById(busId);

        bus.setAvailableSeats(
                bus.getAvailableSeats() + seats
        );

        busRepository.save(bus);
    }

    public void deleteBus(Long id) {
        busRepository.deleteById(id);
    }
}
