package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MomentDTO {
    private Long id;
    private Long userId;
    private String content;
    private List<String> images;
    private Integer likeCount;
    private Integer commentCount;
    private Integer shareCount;
    private LocalDateTime createTime;
    
    // 用户信息
    private String userName;
    private String userAvatar;
    
    // 是否已点赞
    private Boolean isLiked;
    
    // 评论列表
    private List<MomentCommentDTO> comments;
}
