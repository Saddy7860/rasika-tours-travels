package com.rasika.tours.service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class TransportSeatLayout {

    private TransportSeatLayout() {}

    public static List<Map<String, Object>> generate(
            String bookingType,
            String travelClass,
            int capacity
    ) {
        String type = normalize(bookingType);
        String clazz = travelClass == null ? "" : travelClass.trim();

        if (capacity < 1) {
            capacity = defaultCapacity(type, clazz);
        }

        if ("FLIGHT".equals(type)) {
            return flight(clazz, capacity);
        }

        if ("TRAIN".equals(type)) {
            return train(clazz, capacity);
        }

        return bus(clazz, capacity);
    }

    private static List<Map<String, Object>> bus(String clazz, int capacity) {
        String c = normalize(clazz);

        if (c.contains("SLEEPER")) {
            return sleeper("BUS", clazz, capacity);
        }

        return matrix("BUS", clazz, capacity, 2, 2);
    }

    private static List<Map<String, Object>> train(String clazz, int capacity) {
        String c = normalize(clazz);

        if (c.contains("SLEEPER")
                || c.equals("3A")
                || c.equals("2A")
                || c.equals("1A")
                || c.contains("FIRST")) {
            return sleeper("TRAIN", clazz, capacity);
        }

        return matrix("TRAIN", clazz, capacity, 3, 2);
    }

    private static List<Map<String, Object>> flight(String clazz, int capacity) {
        String c = normalize(clazz);

        int left;
        int right;

        if (c.contains("BUSINESS") || c.contains("FIRST")) {
            left = 1;
            right = 1;
        } else if (c.contains("PREMIUM")) {
            left = 2;
            right = 2;
        } else {
            left = 3;
            right = 3;
        }

        return matrix("FLIGHT", clazz, capacity, left, right);
    }

    private static List<Map<String, Object>> matrix(
            String type,
            String clazz,
            int capacity,
            int left,
            int right
    ) {
        List<Map<String, Object>> result = new ArrayList<>();

        String[] leftLabels;
        String[] rightLabels;

        if (left == 1) {
            leftLabels = new String[]{"A"};
        } else if (left == 2) {
            leftLabels = new String[]{"A", "B"};
        } else {
            leftLabels = new String[]{"A", "B", "C"};
        }

        if (right == 1) {
            rightLabels = new String[]{"D"};
        } else if (right == 2) {
            rightLabels = new String[]{"C", "D"};
        } else {
            rightLabels = new String[]{"D", "E", "F"};
        }

        int row = 1;

        while (result.size() < capacity) {
            for (String label : leftLabels) {
                if (result.size() >= capacity) break;
                result.add(seat(row, label, type, clazz, "SEAT", "LEFT"));
            }

            for (String label : rightLabels) {
                if (result.size() >= capacity) break;
                result.add(seat(row, label, type, clazz, "SEAT", "RIGHT"));
            }

            row++;
        }

        return result;
    }

    private static List<Map<String, Object>> sleeper(
            String type,
            String clazz,
            int capacity
    ) {
        List<Map<String, Object>> result = new ArrayList<>();

        int row = 1;

        while (result.size() < capacity) {
            String[] berths = {
                    "LB", "UB", "SL", "SU"
            };

            for (String berth : berths) {
                if (result.size() >= capacity) break;

                result.add(
                        seat(
                                row,
                                berth,
                                type,
                                clazz,
                                "BERTH",
                                berth.equals("LB") || berth.equals("SL")
                                        ? "LOWER"
                                        : "UPPER"
                        )
                );
            }

            row++;
        }

        return result;
    }

    private static Map<String, Object> seat(
            int row,
            String position,
            String type,
            String clazz,
            String kind,
            String side
    ) {
        Map<String, Object> m = new LinkedHashMap<>();

        m.put("seatNumber", row + position);
        m.put("row", row);
        m.put("position", position);
        m.put("bookingType", type);
        m.put("travelClass", clazz);
        m.put("seatType", kind);
        m.put("section", side);

        return m;
    }

    public static int defaultCapacity(String type, String clazz) {
        String c = normalize(clazz);

        if ("FLIGHT".equals(type)) {
            if (c.contains("FIRST")) return 12;
            if (c.contains("BUSINESS")) return 24;
            if (c.contains("PREMIUM")) return 32;
            return 180;
        }

        if ("TRAIN".equals(type)) {
            if (c.contains("1A") || c.contains("FIRST")) return 24;
            if (c.contains("2A")) return 46;
            if (c.contains("3A")) return 72;
            if (c.contains("SLEEPER")) return 72;
            return 56;
        }

        if (c.contains("SLEEPER")) return 36;
        return 40;
    }

    private static String normalize(String value) {
        return value == null
                ? ""
                : value.trim().toUpperCase(Locale.ROOT);
    }
}
