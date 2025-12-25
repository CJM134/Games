package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import hsk.demo.bilibiliserver.dto.MomentDTO;
import hsk.demo.bilibiliserver.entity.Moment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MomentMapper extends BaseMapper<Moment> {
    
    @Select("SELECT m.*, u.nickname as user_name, u.avatar as user_avatar " +
            "FROM moment m LEFT JOIN user u ON m.user_id = u.id " +
            "ORDER BY m.create_time DESC")
    IPage<MomentDTO> selectMomentPage(Page<?> page);
    
    @Select("SELECT m.*, u.nickname as user_name, u.avatar as user_avatar " +
            "FROM moment m LEFT JOIN user u ON m.user_id = u.id " +
            "WHERE m.id = #{momentId}")
    MomentDTO selectMomentById(@Param("momentId") Long momentId);
}
