package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.dto.ConversationDTO;
import hsk.demo.bilibiliserver.dto.MessageDTO;
import hsk.demo.bilibiliserver.entity.Conversation;
import hsk.demo.bilibiliserver.entity.Message;
import hsk.demo.bilibiliserver.mapper.ConversationMapper;
import hsk.demo.bilibiliserver.mapper.MessageMapper;
import hsk.demo.bilibiliserver.service.MessageService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {

    @Resource
    private MessageMapper messageMapper;
    
    @Resource
    private ConversationMapper conversationMapper;

    @Override
    @Transactional
    public boolean sendMessage(Long fromUserId, Long toUserId, String content) {
        // 1. 保存消息
        Message message = new Message();
        message.setFromUserId(fromUserId);
        message.setToUserId(toUserId);
        message.setContent(content);
        message.setIsRead(0);
        message.setCreateTime(LocalDateTime.now());
        baseMapper.insert(message);
        
        // 2. 更新或创建发送者的会话记录
        updateConversation(fromUserId, toUserId, content, LocalDateTime.now(), false);
        
        // 3. 更新或创建接收者的会话记录（增加未读数）
        updateConversation(toUserId, fromUserId, content, LocalDateTime.now(), true);
        
        return true;
    }
    
    private void updateConversation(Long userId, Long otherUserId, String lastMessage, LocalDateTime time, boolean incrementUnread) {
        QueryWrapper<Conversation> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("other_user_id", otherUserId);
        Conversation conversation = conversationMapper.selectOne(wrapper);
        
        if (conversation == null) {
            // 创建新会话
            conversation = new Conversation();
            conversation.setUserId(userId);
            conversation.setOtherUserId(otherUserId);
            conversation.setLastMessage(lastMessage);
            conversation.setLastMessageTime(time);
            conversation.setUnreadCount(incrementUnread ? 1 : 0);
            conversationMapper.insert(conversation);
        } else {
            // 更新会话
            conversation.setLastMessage(lastMessage);
            conversation.setLastMessageTime(time);
            if (incrementUnread) {
                conversation.setUnreadCount(conversation.getUnreadCount() + 1);
            }
            conversationMapper.updateById(conversation);
        }
    }

    @Override
    public List<ConversationDTO> getConversationList(Long userId) {
        return conversationMapper.getUserConversations(userId);
    }

    @Override
    public List<MessageDTO> getConversationMessages(Long userId, Long otherUserId) {
        return messageMapper.getConversationMessages(userId, otherUserId);
    }

    @Override
    @Transactional
    public boolean markAsRead(Long userId, Long otherUserId) {
        // 1. 标记消息为已读
        UpdateWrapper<Message> messageWrapper = new UpdateWrapper<>();
        messageWrapper.eq("from_user_id", otherUserId);
        messageWrapper.eq("to_user_id", userId);
        messageWrapper.eq("is_read", 0);
        messageWrapper.set("is_read", 1);
        baseMapper.update(null, messageWrapper);
        
        // 2. 清空会话未读数
        QueryWrapper<Conversation> convWrapper = new QueryWrapper<>();
        convWrapper.eq("user_id", userId);
        convWrapper.eq("other_user_id", otherUserId);
        Conversation conversation = conversationMapper.selectOne(convWrapper);
        if (conversation != null) {
            conversation.setUnreadCount(0);
            conversationMapper.updateById(conversation);
        }
        
        return true;
    }

    @Override
    public int getUnreadCount(Long userId) {
        QueryWrapper<Conversation> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.gt("unread_count", 0);
        List<Conversation> list = conversationMapper.selectList(wrapper);
        
        if (list == null || list.isEmpty()) {
            return 0;
        }
        
        int total = 0;
        for (Conversation conv : list) {
            if (conv.getUnreadCount() != null) {
                total += conv.getUnreadCount();
            }
        }
        return total;
    }
}
