package com.smartcanteen.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public static class LoginRequest {
        @NotBlank(message = "College email or Student ID is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class StudentRegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Student ID / Roll Number is required")
        private String studentId;

        @NotBlank(message = "College email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Mobile number is required")
        private String mobile;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }

    public static class AdminRegisterRequest {
        @NotBlank(message = "Admin Name is required")
        private String name;

        @NotBlank(message = "College Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String mobile;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Confirm Password is required")
        private String confirmPassword;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }

    public static class AuthResponse {
        private String token;
        private String userId;
        private String studentId;
        private String name;
        private String email;
        private String mobile;
        private String role;

        public AuthResponse(String token, String userId, String studentId, String name, String email, String mobile, String role) {
            this.token = token;
            this.userId = userId;
            this.studentId = studentId;
            this.name = name;
            this.email = email;
            this.mobile = mobile;
            this.role = role;
        }

        public String getToken() { return token; }
        public String getUserId() { return userId; }
        public String getStudentId() { return studentId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getMobile() { return mobile; }
        public String getRole() { return role; }
    }

    public static class ForgotPasswordRequest {
        @NotBlank(message = "College Email is required")
        @Email(message = "Invalid email format")
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        @NotBlank(message = "Reset token is required")
        private String token;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
