package com.smartcanteen.controller;

import com.smartcanteen.dto.ApiResponse;
import com.smartcanteen.model.Notification;
import com.smartcanteen.security.UserPrincipal;
import com.smartcanteen.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        String recipientId = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                ? "ADMIN" : currentUser.getStudentId();

        List<Notification> list = notificationService.getUserNotifications(recipientId);
        return ResponseEntity.ok(ApiResponse.ok("Notifications fetched", list));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        String recipientId = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                ? "ADMIN" : currentUser.getStudentId();

        List<Notification> list = notificationService.getUnreadUserNotifications(recipientId);
        return ResponseEntity.ok(ApiResponse.ok("Unread notifications fetched", list));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable("id") String notificationId, @AuthenticationPrincipal UserPrincipal currentUser) {
        String recipientId = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                ? "ADMIN" : currentUser.getStudentId();

        notificationService.markAsRead(notificationId, recipientId);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserPrincipal currentUser) {
        String recipientId = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                ? "ADMIN" : currentUser.getStudentId();

        notificationService.markAllAsRead(recipientId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable("id") String notificationId, @AuthenticationPrincipal UserPrincipal currentUser) {
        String recipientId = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                ? "ADMIN" : currentUser.getStudentId();

        notificationService.deleteNotification(notificationId, recipientId);
        return ResponseEntity.ok(ApiResponse.ok("Notification deleted"));
    }
}
