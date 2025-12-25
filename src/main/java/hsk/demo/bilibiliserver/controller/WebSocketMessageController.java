package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.dto.MessageDTO;
import hsk.demo.bilibiliserver.service.MessageService;
import jakarta.annotation.Resource;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketMessageController {

    @Resource
    private SimpMessagingTemplate messagingTemplate;
    
    @Resource
    private MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> payload) {
        Long fromUserId = Long.valueOf(payload.get("fromUserId").toString());
        Long toUserId = Long.valueOf(payload.get("toUserId").toString());
        String content = payload.get("content").toString();
        
        // 保存消息到数据库
        messageService.sendMessage(fromUserId, toUserId, content);
        
        // 获取刚发送的消息（包含用户信息）
        java.util.List<MessageDTO> messages = messageService.getConversationMessages(fromUserId, toUserId);
        MessageDTO lastMessage = messages.get(messages.size() - 1);
        
        // 发送给接收者
        messagingTemplate.convertAndSendToUser(
            toUserId.toString(),
            "/queue/messages",
            lastMessage
        );
        
        // 也发送给发送者（用于确认）
        messagingTemplate.convertAndSendToUser(
            fromUserId.toString(),
            "/queue/messages",
            lastMessage
        );
    }
}
