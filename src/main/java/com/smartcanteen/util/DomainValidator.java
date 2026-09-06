package com.smartcanteen.util;

public class DomainValidator {

    public static final String MANDATORY_DOMAIN = "aaacet.ac.in";

    public static boolean isValidCollegeEmail(String email) {
        if (email == null) return false;
        String trimmed = email.trim().toLowerCase();
        if (!trimmed.endsWith("@" + MANDATORY_DOMAIN)) {
            return false;
        }
        String localPart = trimmed.substring(0, trimmed.indexOf('@'));
        return !localPart.isEmpty();
    }

    public static String formatCollegeEmail(String rawInput) {
        if (rawInput == null) return "";
        String trimmed = rawInput.trim().toLowerCase();
        if (trimmed.contains("@")) {
            return trimmed;
        }
        return trimmed + "@" + MANDATORY_DOMAIN;
    }

    public static String extractStudentId(String emailOrId) {
        if (emailOrId == null) return "";
        String trimmed = emailOrId.trim();
        if (trimmed.contains("@")) {
            return trimmed.substring(0, trimmed.indexOf('@')).toUpperCase();
        }
        return trimmed.toUpperCase();
    }
}
