package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long userId;
    private Long fromUserId;
    private String type;
    private String content;
    private Long relatedId;
    private Integer isRead;
    private LocalDateTime createTime;

    // 触发用户信息
    private String fromUserName;
    private String fromUserAvatar;
}