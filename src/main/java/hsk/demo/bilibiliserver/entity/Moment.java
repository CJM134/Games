package hsk.demo.bilibiliserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("moment")
public class Moment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String content;
    private String images;  // JSON格式的图片URL列表
    private Integer likeCount;
    private Integer commentCount;
    private Integer shareCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
