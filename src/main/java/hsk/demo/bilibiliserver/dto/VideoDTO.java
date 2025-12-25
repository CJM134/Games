package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VideoDTO {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String coverUrl;
    private String videoUrl;
    private Integer duration;
    private Long categoryId;
    private Integer playCount;
    private Integer likeCount;
    private Integer coinCount;
    private Integer collectCount;
    private Integer shareCount;
    private Integer commentCount;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // 用户信息
    private String userName;
    private String userAvatar;
    
    // 热度分数（用于推荐算法）
    private Double hotScore;
}
