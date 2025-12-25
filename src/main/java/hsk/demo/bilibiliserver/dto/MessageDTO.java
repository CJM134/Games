package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private Long fromUserId;
    private Long toUserId;
    private String content;
    private Integer isRead;
    private LocalDateTime createTime;
    
    // 发送者信息
    private String fromUserName;
    private String fromUserAvatar;
    
    // 接收者信息
    private String toUserName;
    private String toUserAvatar;
}
