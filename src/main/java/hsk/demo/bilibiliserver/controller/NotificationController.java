package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.dto.NotificationDTO;
import hsk.demo.bilibiliserver.service.NotificationService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {

    @Resource
    private NotificationService notificationService;

    // 获取通知列表
    @GetMapping("/list")
    public Result<List<NotificationDTO>> getNotifications(@RequestParam Long userId,
                                                          @RequestParam(defaultValue = "50") int limit) {
        return Result.success(notificationService.getUserNotifications(userId, limit));
    }

    // 标记单个通知为已读
    @PutMapping("/{id}/read")
    public Result<String> markAsRead(@PathVariable Long id) {
        boolean success = notificationService.markAsRead(id);
        return success ? Result.success("标记成功") : Result.error("标记失败");
    }

    // 标记所有通知为已读
    @PutMapping("/read-all")
    public Result<String> markAllAsRead(@RequestParam Long userId) {
        boolean success = notificationService.markAllAsRead(userId);
        return success ? Result.success("全部标记成功") : Result.error("标记失败");
    }

    // 获取未读通知数
    @GetMapping("/unread-count")
    public Result<Map<String, Integer>> getUnreadCount(@RequestParam Long userId) {
        int count = notificationService.getUnreadCount(userId);
        Map<String, Integer> result = new HashMap<>();
        result.put("unreadCount", count);
        return Result.success(result);
    }
}
