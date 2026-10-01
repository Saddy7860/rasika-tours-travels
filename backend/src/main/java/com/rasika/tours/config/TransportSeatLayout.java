package com.rasika.tours.config;

import java.util.ArrayList;
import java.util.List;

public final class TransportSeatLayout {

    private TransportSeatLayout() {}

    public static List<String> generateSeats(String type, int capacity) {
        List<String> seats = new ArrayList<>();

        int rows;
        int columns;

        switch (type == null ? "" : type.toUpperCase()) {
            case "BUS":
                columns = 4;
                break;
            case "TRAIN":
            case "FLIGHT":
                columns = 4;
                break;
            default:
                columns = 4;
        }

        rows = (int) Math.ceil((double) capacity / columns);

        for (int row = 1; row <= rows; row++) {
            for (int col = 0; col < columns; col++) {
                if (seats.size() >= capacity) {
                    break;
                }

                char letter = (char) ('A' + col);
                seats.add(row + String.valueOf(letter));
            }
        }

        return seats;
    }
}
