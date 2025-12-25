package hsk.demo.bilibiliserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("moment_comment")
public class MomentComment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long momentId;
    private Long userId;
    private String content;
    private LocalDateTime createTime;
}
