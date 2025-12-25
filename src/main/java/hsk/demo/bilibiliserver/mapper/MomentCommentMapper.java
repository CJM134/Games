package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import hsk.demo.bilibiliserver.dto.MomentCommentDTO;
import hsk.demo.bilibiliserver.entity.MomentComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MomentCommentMapper extends BaseMapper<MomentComment> {
    
    @Select("SELECT mc.*, u.nickname as user_name, u.avatar as user_avatar " +
            "FROM moment_comment mc LEFT JOIN user u ON mc.user_id = u.id " +
            "WHERE mc.moment_id = #{momentId} " +
            "ORDER BY mc.create_time DESC")
    List<MomentCommentDTO> selectCommentsByMomentId(@Param("momentId") Long momentId);
}
