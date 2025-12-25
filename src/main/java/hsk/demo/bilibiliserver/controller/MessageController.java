package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.dto.ConversationDTO;
import hsk.demo.bilibiliserver.dto.MessageDTO;
import hsk.demo.bilibiliserver.service.MessageService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Resource
    private MessageService messageService;

    // 发送消息
    @PostMapping("/send")
    public Result<String> sendMessage(@RequestParam Long fromUserId, 
                                     @RequestParam Long toUserId, 
                                     @RequestParam String content) {
        boolean success = messageService.sendMessage(fromUserId, toUserId, content);
        return success ? Result.success("发送成功") : Result.error("发送失败");
    }

    // 获取会话列表
    @GetMapping("/conversations")
    public Result<List<ConversationDTO>> getConversations(@RequestParam Long userId) {
        return Result.success(messageService.getConversationList(userId));
    }

    // 获取会话消息
    @GetMapping("/conversation/{otherUserId}")
    public Result<List<MessageDTO>> getConversationMessages(@RequestParam Long userId, 
                                                            @PathVariable Long otherUserId) {
        List<MessageDTO> messages = messageService.getConversationMessages(userId, otherUserId);
        // 标记为已读
        messageService.markAsRead(userId, otherUserId);
        return Result.success(messages);
    }

    // 获取未读消息总数
    @GetMapping("/unread")
    public Result<Map<String, Integer>> getUnreadCount(@RequestParam Long userId) {
        int count = messageService.getUnreadCount(userId);
        Map<String, Integer> result = new HashMap<>();
        result.put("unreadCount", count);
        return Result.success(result);
    }
}
