package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import hsk.demo.bilibiliserver.dto.MessageDTO;
import hsk.demo.bilibiliserver.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MessageMapper extends BaseMapper<Message> {
    
    @Select("SELECT m.*, " +
            "fu.nickname as from_user_name, fu.avatar as from_user_avatar, " +
            "tu.nickname as to_user_name, tu.avatar as to_user_avatar " +
            "FROM message m " +
            "LEFT JOIN user fu ON m.from_user_id = fu.id " +
            "LEFT JOIN user tu ON m.to_user_id = tu.id " +
            "WHERE (m.from_user_id = #{userId} AND m.to_user_id = #{otherUserId}) " +
            "   OR (m.from_user_id = #{otherUserId} AND m.to_user_id = #{userId}) " +
            "ORDER BY m.create_time ASC")
    List<MessageDTO> getConversationMessages(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);
}
