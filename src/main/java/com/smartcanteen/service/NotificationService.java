package com.smartcanteen.service;

import com.smartcanteen.model.Notification;
import com.smartcanteen.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(String recipientUserId, String recipientRole, String orderId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setNotificationId("NOTIF_" + UUID.randomUUID().toString().substring(0, 8));
        notification.setRecipientUserId(recipientUserId);
        notification.setRecipientRole(recipientRole);
        notification.setOrderId(orderId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setReadStatus(false);

        notificationRepository.save(notification);

        // Send via WebSocket if template is active
        if (messagingTemplate != null) {
            try {
                if ("ADMIN".equalsIgnoreCase(recipientRole)) {
                    messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
                } else {
                    messagingTemplate.convertAndSend("/topic/student/" + recipientUserId + "/notifications", notification);
                }
            } catch (Exception e) {
                // WebSocket broadcast optional error ignored
            }
        }

        return notification;
    }

    public List<Notification> getUserNotifications(String recipientUserId) {
        return notificationRepository.findByRecipient(recipientUserId);
    }

    public List<Notification> getUnreadUserNotifications(String recipientUserId) {
        return notificationRepository.findUnreadByRecipient(recipientUserId);
    }

    public void markAsRead(String notificationId, String recipientUserId) {
        notificationRepository.markAsRead(notificationId, recipientUserId);
    }

    public void markAllAsRead(String recipientUserId) {
        notificationRepository.markAllAsRead(recipientUserId);
    }

    public void deleteNotification(String notificationId, String recipientUserId) {
        notificationRepository.deleteById(notificationId, recipientUserId);
    }
}
