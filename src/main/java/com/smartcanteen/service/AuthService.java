package com.smartcanteen.service;

import com.smartcanteen.dto.AuthDTOs.*;
import com.smartcanteen.exception.CustomExceptions.*;
import com.smartcanteen.model.PasswordResetToken;
import com.smartcanteen.model.User;
import com.smartcanteen.repository.PasswordResetTokenRepository;
import com.smartcanteen.repository.UserRepository;
import com.smartcanteen.security.JwtTokenProvider;
import com.smartcanteen.util.DomainValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    public AuthResponse registerStudent(StudentRegisterRequest req) {
        // Enforce College Domain
        String email = DomainValidator.formatCollegeEmail(req.getEmail());
        if (!DomainValidator.isValidCollegeEmail(email)) {
            throw new InvalidDomainException("Registration restricted to AAACET College Email (@aaacet.ac.in)");
        }

        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("An account with this college email already exists.");
        }

        String studentId = DomainValidator.extractStudentId(req.getStudentId());
        if (userRepository.existsByStudentId(studentId)) {
            throw new UserAlreadyExistsException("An account with this Student ID already exists.");
        }

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new PasswordMismatchException("Password and Confirm Password do not match.");
        }

        User user = new User();
        user.setUserId(studentId);
        user.setStudentId(studentId);
        user.setName(req.getName());
        user.setEmail(email);
        user.setMobile(req.getMobile());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole("STUDENT");
        user.setAccountStatus("ACTIVE");
        user.setEmailVerified(true);

        userRepository.save(user);

        // Send Email & Notification
        emailService.sendRegistrationConfirmation(email, req.getName());
        emailService.sendAdminRegistrationAlert(email, req.getName(), studentId, "STUDENT");
        notificationService.createNotification(studentId, "STUDENT", null,
                "Welcome to Smart Canteen", "Your student account (" + studentId + ") has been successfully activated.", "system");

        // Authenticate & Produce Token
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, req.getPassword())
        );
        String token = tokenProvider.generateToken(auth);

        return new AuthResponse(token, user.getUserId(), user.getStudentId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole());
    }

    public AuthResponse registerAdmin(AdminRegisterRequest req) {
        String email = DomainValidator.formatCollegeEmail(req.getEmail());
        if (!DomainValidator.isValidCollegeEmail(email)) {
            throw new InvalidDomainException("Admin registration restricted to AAACET Domain (@aaacet.ac.in)");
        }

        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("An account with this admin email already exists.");
        }

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new PasswordMismatchException("Password and Confirm Password do not match.");
        }

        String adminId = "ADM" + System.currentTimeMillis() % 10000;
        User user = new User();
        user.setUserId(adminId);
        user.setStudentId(adminId);
        user.setName(req.getName());
        user.setEmail(email);
        user.setMobile(req.getMobile() != null ? req.getMobile() : "+91 90000 00000");
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole("ADMIN");
        user.setAccountStatus("ACTIVE");
        user.setEmailVerified(true);

        userRepository.save(user);

        emailService.sendRegistrationConfirmation(email, req.getName());
        emailService.sendAdminRegistrationAlert(email, req.getName(), adminId, "ADMIN");

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, req.getPassword())
        );
        String token = tokenProvider.generateToken(auth);

        return new AuthResponse(token, user.getUserId(), user.getStudentId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole());
    }

    public AuthResponse login(LoginRequest req, String expectedRole) {
        String input = req.getEmail().trim();
        String email = DomainValidator.formatCollegeEmail(input);

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.findByStudentId(input.toUpperCase())
                        .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password.")));

        if (!user.getRole().equalsIgnoreCase(expectedRole)) {
            throw new InvalidCredentialsException("Access Denied: Account is registered as " + user.getRole() + ", not " + expectedRole);
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), req.getPassword())
            );
            String token = tokenProvider.generateToken(auth);

            return new AuthResponse(token, user.getUserId(), user.getStudentId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole());
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }
    }

    public void initiateForgotPassword(ForgotPasswordRequest req) {
        String email = DomainValidator.formatCollegeEmail(req.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("If the email exists, a password reset link has been sent."));

        String rawToken = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setTokenHash(rawToken);
        token.setExpiresAt(new Timestamp(System.currentTimeMillis() + (15 * 60 * 1000))); // 15 mins
        token.setUsed(false);

        resetTokenRepository.save(token);
        emailService.sendPasswordResetEmail(email, rawToken);
    }

    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken resetToken = resetTokenRepository.findByTokenHash(req.getToken())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired password reset token."));

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found."));

        String newHash = passwordEncoder.encode(req.getNewPassword());
        userRepository.updatePassword(user.getId(), newHash);
        resetTokenRepository.markAsUsed(resetToken.getId());

        emailService.sendEmail(user.getEmail(), "Password Reset Successful", "Your Smart Canteen password has been successfully updated.");
    }
}
