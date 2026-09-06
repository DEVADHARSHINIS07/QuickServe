package com.smartcanteen.controller;

import com.smartcanteen.dto.ApiResponse;
import com.smartcanteen.dto.AuthDTOs.*;
import com.smartcanteen.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/student/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerStudent(@Valid @RequestBody StudentRegisterRequest req) {
        AuthResponse resp = authService.registerStudent(req);
        return ResponseEntity.ok(ApiResponse.ok("Student registration successful", resp));
    }

    @PostMapping("/student/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginStudent(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.login(req, "STUDENT");
        return ResponseEntity.ok(ApiResponse.ok("Student login successful", resp));
    }

    @PostMapping("/admin/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerAdmin(@Valid @RequestBody AdminRegisterRequest req) {
        AuthResponse resp = authService.registerAdmin(req);
        return ResponseEntity.ok(ApiResponse.ok("Canteen Admin registration successful", resp));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginAdmin(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.login(req, "ADMIN");
        return ResponseEntity.ok(ApiResponse.ok("Admin login successful", resp));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.initiateForgotPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("If the registered college email exists, password reset token has been dispatched."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("Password reset completed successfully. You can now log in with your new password."));
    }
}
