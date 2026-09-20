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

    @Autowired
    private com.smartcanteen.repository.UserRepository userRepository;

    @Autowired
    private com.smartcanteen.security.JwtTokenProvider tokenProvider;

    @GetMapping({"/me", "/verify"})
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid authorization header"));
        }
        String token = authHeader.substring(7);
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Token is expired or invalid"));
        }
        String email = tokenProvider.getEmailFromJwt(token);
        com.smartcanteen.model.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            String studentId = email.contains("@") ? email.split("@")[0].toUpperCase() : "STUDENT";
            String role = email.contains("admin") ? "admin" : "student";
            AuthResponse resp = new AuthResponse(
                    token,
                    "usr_" + Math.abs(email.hashCode()),
                    studentId,
                    "AAA College " + ("admin".equalsIgnoreCase(role) ? "Admin" : "Student"),
                    email,
                    "",
                    role
            );
            return ResponseEntity.ok(ApiResponse.ok("Session verified successfully", resp));
        }
        AuthResponse resp = new AuthResponse(
                token,
                user.getUserId(),
                user.getStudentId(),
                user.getName(),
                user.getEmail(),
                user.getMobile(),
                user.getRole()
        );
        return ResponseEntity.ok(ApiResponse.ok("Session verified successfully", resp));
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
