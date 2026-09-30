package com.rasika.tours.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "service_seat_configs",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"booking_type", "service_id"}
    )
)
public class ServiceSeatConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_type", nullable = false)
    private String bookingType;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(nullable = false)
    private Integer seatCapacity;

    @Column(nullable = false)
    private String layout;

    @Column(columnDefinition = "TEXT")
    private String blockedSeats;

    public ServiceSeatConfig() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingType() {
        return bookingType;
    }

    public void setBookingType(String bookingType) {
        this.bookingType = bookingType;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Integer getSeatCapacity() {
        return seatCapacity;
    }

    public void setSeatCapacity(Integer seatCapacity) {
        this.seatCapacity = seatCapacity;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public String getBlockedSeats() {
        return blockedSeats;
    }

    public void setBlockedSeats(String blockedSeats) {
        this.blockedSeats = blockedSeats;
    }
}
