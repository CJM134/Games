package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import hsk.demo.bilibiliserver.dto.ConversationDTO;
import hsk.demo.bilibiliserver.entity.Conversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ConversationMapper extends BaseMapper<Conversation> {
    
    @Select("SELECT c.*, u.nickname as other_user_name, u.avatar as other_user_avatar " +
            "FROM conversation c " +
            "LEFT JOIN user u ON c.other_user_id = u.id " +
            "WHERE c.user_id = #{userId} " +
            "ORDER BY c.update_time DESC")
    List<ConversationDTO> getUserConversations(@Param("userId") Long userId);
}
