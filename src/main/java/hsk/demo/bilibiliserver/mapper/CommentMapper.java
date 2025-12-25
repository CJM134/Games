package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import hsk.demo.bilibiliserver.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
