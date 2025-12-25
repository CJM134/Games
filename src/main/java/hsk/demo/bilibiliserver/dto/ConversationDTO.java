package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationDTO {
    private Long id;
    private Long userId;
    private Long otherUserId;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
    
    // 对方用户信息
    private String otherUserName;
    private String otherUserAvatar;
}
