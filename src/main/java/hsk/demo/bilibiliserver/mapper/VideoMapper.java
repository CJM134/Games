package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import hsk.demo.bilibiliserver.dto.VideoDTO;
import hsk.demo.bilibiliserver.entity.Video;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface VideoMapper extends BaseMapper<Video> {
    
    @Select("<script>" +
            "SELECT v.id, v.user_id, v.title, v.description, v.cover_url, v.video_url, " +
            "v.duration, v.category_id, v.play_count, v.like_count, v.coin_count, " +
            "v.collect_count, v.share_count, " +
            "(SELECT COUNT(*) FROM comment WHERE video_id = v.id) as comment_count, " +
            "v.status, v.create_time, v.update_time, " +
            "u.nickname as user_name, u.avatar as user_avatar " +
            "FROM video v LEFT JOIN user u ON v.user_id = u.id " +
            "WHERE v.status = 1 " +
            "<if test='categoryId != null'> AND v.category_id = #{categoryId} </if>" +
            "ORDER BY v.create_time DESC" +
            "</script>")
    @ResultMap("VideoDTOMap")
    IPage<VideoDTO> selectVideoPage(Page<?> page, @Param("categoryId") Long categoryId);
    
    @Select("<script>" +
            "SELECT v.id, v.user_id, v.title, v.description, v.cover_url, v.video_url, " +
            "v.duration, v.category_id, v.play_count, v.like_count, v.coin_count, " +
            "v.collect_count, v.share_count, " +
            "(SELECT COUNT(*) FROM comment WHERE video_id = v.id) as comment_count, " +
            "v.status, v.create_time, v.update_time, " +
            "u.nickname as user_name, u.avatar as user_avatar " +
            "FROM video v LEFT JOIN user u ON v.user_id = u.id " +
            "WHERE v.status = 1 " +
            "AND (v.title LIKE CONCAT('%', #{keyword}, '%') OR v.description LIKE CONCAT('%', #{keyword}, '%')) " +
            "ORDER BY v.create_time DESC" +
            "</script>")
    @ResultMap("VideoDTOMap")
    IPage<VideoDTO> searchVideoPage(Page<?> page, @Param("keyword") String keyword);
    
    @Select("SELECT v.id, v.user_id, v.title, v.description, v.cover_url, v.video_url, " +
            "v.duration, v.category_id, v.play_count, v.like_count, v.coin_count, " +
            "v.collect_count, v.share_count, " +
            "(SELECT COUNT(*) FROM comment WHERE video_id = v.id) as comment_count, " +
            "v.status, v.create_time, v.update_time, " +
            "u.nickname as user_name, u.avatar as user_avatar " +
            "FROM video v LEFT JOIN user u ON v.user_id = u.id " +
            "WHERE v.id = #{videoId}")
    @ResultMap("VideoDTOMap")
    VideoDTO selectVideoWithUser(@Param("videoId") Long videoId);
    
    @Select("SELECT v.id, v.user_id, v.title, v.description, v.cover_url, v.video_url, " +
            "v.duration, v.category_id, v.play_count, v.like_count, v.coin_count, " +
            "v.collect_count, v.share_count, " +
            "(SELECT COUNT(*) FROM comment WHERE video_id = v.id) as comment_count, " +
            "v.status, v.create_time, v.update_time, " +
            "u.nickname as user_name, u.avatar as user_avatar " +
            "FROM video v LEFT JOIN user u ON v.user_id = u.id " +
            "WHERE v.status = 1 " +
            "ORDER BY v.create_time DESC")
    @ResultMap("VideoDTOMap")
    List<VideoDTO> selectRecentVideos();
}
