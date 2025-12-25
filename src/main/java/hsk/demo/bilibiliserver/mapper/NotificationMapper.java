package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import hsk.demo.bilibiliserver.dto.NotificationDTO;
import hsk.demo.bilibiliserver.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
    
    @Select("SELECT n.*, u.nickname as from_user_name, u.avatar as from_user_avatar " +
            "FROM notification n " +
            "LEFT JOIN user u ON n.from_user_id = u.id " +
            "WHERE n.user_id = #{userId} " +
            "ORDER BY n.create_time DESC " +
            "LIMIT #{limit}")
    List<NotificationDTO> getUserNotifications(@Param("userId") Long userId, @Param("limit") int limit);
}
