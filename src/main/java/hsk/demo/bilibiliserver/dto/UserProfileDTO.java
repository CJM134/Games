package hsk.demo.bilibiliserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileDTO {
    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private String signature;
    private Integer gender;
    private LocalDateTime birthday;
    private LocalDateTime createTime;
    
    // 统计信息
    private Integer followCount;
    private Integer fansCount;
    private Integer videoCount;
    
    // 是否已关注（当前登录用户是否关注了该用户）
    private Boolean isFollowed;
}
