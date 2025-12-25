package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.dto.ConversationDTO;
import hsk.demo.bilibiliserver.dto.MessageDTO;
import hsk.demo.bilibiliserver.entity.Message;

import java.util.List;

public interface MessageService extends IService<Message> {
    
    // 发送消息
    boolean sendMessage(Long fromUserId, Long toUserId, String content);
    
    // 获取会话列表
    List<ConversationDTO> getConversationList(Long userId);
    
    // 获取会话消息
    List<MessageDTO> getConversationMessages(Long userId, Long otherUserId);
    
    // 标记消息为已读
    boolean markAsRead(Long userId, Long otherUserId);
    
    // 获取未读消息总数
    int getUnreadCount(Long userId);
}
