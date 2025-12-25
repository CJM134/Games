package hsk.demo.bilibiliserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("conversation")
public class Conversation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long otherUserId;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
    private LocalDateTime updateTime;
}
