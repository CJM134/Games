package hsk.demo.bilibiliserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("video_like")
public class VideoLike {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("video_id")
    private Long videoId;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("create_time")
    private LocalDateTime createTime;
}
