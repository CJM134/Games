package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.dto.NotificationDTO;
import hsk.demo.bilibiliserver.entity.Notification;
import hsk.demo.bilibiliserver.mapper.NotificationMapper;
import hsk.demo.bilibiliserver.service.NotificationService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    @Resource
    private NotificationMapper notificationMapper;

    @Override
    public void createNotification(Long userId, Long fromUserId, String type, String content, Long relatedId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setFromUserId(fromUserId);
        notification.setType(type);
        notification.setContent(content);
        notification.setRelatedId(relatedId);
        notification.setIsRead(0);
        notification.setCreateTime(LocalDateTime.now());
        baseMapper.insert(notification);
    }

    @Override
    public List<NotificationDTO> getUserNotifications(Long userId, int limit) {
        return notificationMapper.getUserNotifications(userId, limit);
    }

    @Override
    public boolean markAsRead(Long notificationId) {
        Notification notification = baseMapper.selectById(notificationId);
        if (notification != null) {
            notification.setIsRead(1);
            return baseMapper.updateById(notification) > 0;
        }
        return false;
    }

    @Override
    public boolean markAllAsRead(Long userId) {
        UpdateWrapper<Notification> wrapper = new UpdateWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("is_read", 0);
        wrapper.set("is_read", 1);
        return baseMapper.update(null, wrapper) > 0;
    }

    @Override
    public int getUnreadCount(Long userId) {
        QueryWrapper<Notification> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("is_read", 0);
        return Math.toIntExact(baseMapper.selectCount(wrapper));
    }
}
