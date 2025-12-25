package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.entity.Video;
import hsk.demo.bilibiliserver.entity.VideoLike;
import hsk.demo.bilibiliserver.mapper.VideoLikeMapper;
import hsk.demo.bilibiliserver.mapper.VideoMapper;
import hsk.demo.bilibiliserver.service.NotificationService;
import hsk.demo.bilibiliserver.service.VideoLikeService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class VideoLikeServiceImpl extends ServiceImpl<VideoLikeMapper, VideoLike> implements VideoLikeService {

    @Resource
    private VideoMapper videoMapper;
    
    @Resource
    private RedisTemplate<String, Object> redisTemplate;
    
    @Resource
    private NotificationService notificationService;

    @Override
    @Transactional
    public boolean likeVideo(Long videoId, Long userId) {
        // 检查是否已点赞
        if (isLiked(videoId, userId)) {
            return false;
        }
        
        // 添加点赞记录
        VideoLike videoLike = new VideoLike();
        videoLike.setVideoId(videoId);
        videoLike.setUserId(userId);
        videoLike.setCreateTime(LocalDateTime.now());
        baseMapper.insert(videoLike);
        
        // 更新视频点赞数
        Video video = videoMapper.selectById(videoId);
        if (video != null) {
            Integer currentCount = video.getLikeCount();
            video.setLikeCount(currentCount != null ? currentCount + 1 : 1);
            videoMapper.updateById(video);
            
            // 创建通知（不给自己发通知）
            if (!video.getUserId().equals(userId)) {
                notificationService.createNotification(
                    video.getUserId(),
                    userId,
                    "like",
                    "点赞了你的视频",
                    videoId
                );
            }
        }
        
        // 更新Redis缓存
        try {
            String cacheKey = "video:like:" + videoId + ":" + userId;
            redisTemplate.opsForValue().set(cacheKey, true, 30, TimeUnit.MINUTES);
        } catch (Exception e) {
            System.err.println("Redis cache error: " + e.getMessage());
        }
        
        return true;
    }

    @Override
    @Transactional
    public boolean unlikeVideo(Long videoId, Long userId) {
        // 删除点赞记录
        QueryWrapper<VideoLike> wrapper = new QueryWrapper<>();
        wrapper.eq("video_id", videoId);
        wrapper.eq("user_id", userId);
        int deleted = baseMapper.delete(wrapper);
        
        if (deleted > 0) {
            // 更新视频点赞数
            Video video = videoMapper.selectById(videoId);
            if (video != null) {
                Integer currentCount = video.getLikeCount();
                if (currentCount != null && currentCount > 0) {
                    video.setLikeCount(currentCount - 1);
                    videoMapper.updateById(video);
                }
            }
            
            // 删除Redis缓存
            try {
                String cacheKey = "video:like:" + videoId + ":" + userId;
                redisTemplate.delete(cacheKey);
            } catch (Exception e) {
                System.err.println("Redis cache error: " + e.getMessage());
            }
            
            return true;
        }
        
        return false;
    }

    @Override
    public boolean isLiked(Long videoId, Long userId) {
        try {
            // 先查Redis缓存
            String cacheKey = "video:like:" + videoId + ":" + userId;
            Boolean cached = (Boolean) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return cached;
            }
        } catch (Exception e) {
            System.err.println("Redis cache error: " + e.getMessage());
        }
        
        // 查询数据库
        QueryWrapper<VideoLike> wrapper = new QueryWrapper<>();
        wrapper.eq("video_id", videoId);
        wrapper.eq("user_id", userId);
        boolean liked = baseMapper.selectCount(wrapper) > 0;
        
        // 写入缓存
        try {
            String cacheKey = "video:like:" + videoId + ":" + userId;
            redisTemplate.opsForValue().set(cacheKey, liked, 30, TimeUnit.MINUTES);
        } catch (Exception e) {
            System.err.println("Redis cache error: " + e.getMessage());
        }
        
        return liked;
    }

    @Override
    public int getLikeCount(Long videoId) {
        Video video = videoMapper.selectById(videoId);
        if (video != null && video.getLikeCount() != null) {
            return video.getLikeCount();
        }
        return 0;
    }
}
