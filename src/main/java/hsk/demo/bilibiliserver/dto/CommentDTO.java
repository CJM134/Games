package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentDTO {
    private Long id;
    private Long videoId;
    private Long userId;
    private Long parentId;
    private String content;
    private Integer likeCount;
    private LocalDateTime createTime;
    
    // 用户信息
    private String userName;
    private String userAvatar;
    
    // 回复列表
    private List<CommentDTO> replies;
    
    // 回复数量
    private Integer replyCount;
}
