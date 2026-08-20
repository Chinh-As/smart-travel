package com.smarttravel.notification.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.notification.dto.NotificationResponse;
import com.smarttravel.notification.entity.Notification;
import com.smarttravel.notification.repository.NotificationRepository;
import com.smarttravel.review.entity.Rating;
import com.smarttravel.place.entity.Place;
import com.smarttravel.user.entity.User;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Page<NotificationResponse> getNotifications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return notificationRepository.findAll(pageable).map(this::mapToResponse);
    }

    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Transactional
    public void markAsRead(UUID id) {
        notificationRepository.markAsRead(id);
    }

    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsRead();
    }

    @Transactional
    public void createReviewNotification(User user, Place place, Rating rating) {
        String username = user.getName();
        if (username == null || username.isBlank()) {
            username = user.getUsername();
        }
        if (username == null || username.isBlank()) {
            username = user.getEmail().split("@")[0];
        }

        Notification notification = Notification.builder()
                .userId(user.getId())
                .type("REVIEW")
                .title("Đánh giá mới chờ duyệt")
                .message(username + " đã đánh giá " + rating.getRatingPoint() + " sao cho " + place.getName())
                .referenceId(rating.getId().toString())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .isRead(notification.getIsRead())
                .build();
    }

}
