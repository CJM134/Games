package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MomentCommentDTO {
    private Long id;
    private Long momentId;
    private Long userId;
    private String content;
    private LocalDateTime createTime;
    
    // 用户信息
    private String userName;
    private String userAvatar;
}
