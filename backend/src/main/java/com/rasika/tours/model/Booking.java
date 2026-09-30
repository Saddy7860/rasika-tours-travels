package com.rasika.tours.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private String bookingType;
    @Column(nullable = false)
    private Long serviceId;
    @Column(nullable = false, unique = true)
    private String bookingReference;
    @Column(nullable = false)
    private Integer numberOfPassengers;
    @Column(nullable = false)
    private Double totalAmount;
    @Column(nullable = false)
    private String paymentStatus;
    @Column(nullable = false)
    private String bookingStatus;

    @Column
    private String refundStatus;

    @Column
    private LocalDate journeyDate;

    private String travelClass;

    @Column
    private String seatNumbers;
    @Column(nullable = false)
    private LocalDateTime bookingDate = LocalDateTime.now();
    @Column(columnDefinition = "TEXT")
    private String passengerDetails;

    public Booking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getBookingType() { return bookingType; }
    public void setBookingType(String bookingType) { this.bookingType = bookingType; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public Integer getNumberOfPassengers() { return numberOfPassengers; }
    public void setNumberOfPassengers(Integer numberOfPassengers) { this.numberOfPassengers = numberOfPassengers; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
    public String getRefundStatus() { return refundStatus; }

    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }

    public String getTravelClass() {
        return travelClass;
    }

    public void setTravelClass(String travelClass) {
        this.travelClass = travelClass;
    }

    public String getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(String seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    public String getPassengerDetails() { return passengerDetails; }
    public void setPassengerDetails(String passengerDetails) { this.passengerDetails = passengerDetails; }

    public LocalDate getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(LocalDate journeyDate) {
        this.journeyDate = journeyDate;
    }

}
