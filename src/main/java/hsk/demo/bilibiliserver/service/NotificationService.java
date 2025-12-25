package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.dto.NotificationDTO;
import hsk.demo.bilibiliserver.entity.Notification;

import java.util.List;

public interface NotificationService extends IService<Notification> {
    
    // 创建通知
    void createNotification(Long userId, Long fromUserId, String type, String content, Long relatedId);
    
    // 获取用户通知列表
    List<NotificationDTO> getUserNotifications(Long userId, int limit);
    
    // 标记为已读
    boolean markAsRead(Long notificationId);
    
    // 标记所有为已读
    boolean markAllAsRead(Long userId);
    
    // 获取未读数量
    int getUnreadCount(Long userId);
}
