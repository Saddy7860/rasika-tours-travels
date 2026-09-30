package com.rasika.tours.repository;

import com.rasika.tours.model.PassportRequest;
import com.rasika.tours.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassportRepository
        extends JpaRepository<PassportRequest, Long> {

    List<PassportRequest> findByUser(User user);

    List<PassportRequest>
            findByUserOrderByRequestDateDesc(User user);

    List<PassportRequest>
            findAllByOrderByRequestDateDesc();

    List<PassportRequest>
            findByStatus(String status);
}
