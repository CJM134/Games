package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.entity.Video;
import hsk.demo.bilibiliserver.entity.VideoCollect;
import hsk.demo.bilibiliserver.mapper.VideoCollectMapper;
import hsk.demo.bilibiliserver.mapper.VideoMapper;
import hsk.demo.bilibiliserver.service.NotificationService;
import hsk.demo.bilibiliserver.service.VideoCollectService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class VideoCollectServiceImpl extends ServiceImpl<VideoCollectMapper, VideoCollect> implements VideoCollectService {

    @Resource
    private VideoMapper videoMapper;
    
    @Resource
    private RedisTemplate<String, Object> redisTemplate;
    
    @Resource
    private NotificationService notificationService;

    @Override
    @Transactional
    public boolean collectVideo(Long videoId, Long userId) {
        // 检查是否已收藏
        if (isCollected(videoId, userId)) {
            return false;
        }
        
        // 添加收藏记录
        VideoCollect videoCollect = new VideoCollect();
        videoCollect.setVideoId(videoId);
        videoCollect.setUserId(userId);
        videoCollect.setCreateTime(LocalDateTime.now());
        baseMapper.insert(videoCollect);
        
        // 更新视频收藏数
        Video video = videoMapper.selectById(videoId);
        if (video != null) {
            Integer currentCount = video.getCollectCount();
            video.setCollectCount(currentCount != null ? currentCount + 1 : 1);
            videoMapper.updateById(video);
            
            // 创建通知（不给自己发通知）
            if (!video.getUserId().equals(userId)) {
                notificationService.createNotification(
                    video.getUserId(),
                    userId,
                    "collect",
                    "收藏了你的视频",
                    videoId
                );
            }
        }
        
        // 更新Redis缓存
        try {
            String cacheKey = "video:collect:" + videoId + ":" + userId;
            redisTemplate.opsForValue().set(cacheKey, true, 30, TimeUnit.MINUTES);
        } catch (Exception e) {
            System.err.println("Redis cache error: " + e.getMessage());
        }
        
        return true;
    }

    @Override
    @Transactional
    public boolean uncollectVideo(Long videoId, Long userId) {
        // 删除收藏记录
        QueryWrapper<VideoCollect> wrapper = new QueryWrapper<>();
        wrapper.eq("video_id", videoId);
        wrapper.eq("user_id", userId);
        int deleted = baseMapper.delete(wrapper);
        
        if (deleted > 0) {
            // 更新视频收藏数
            Video video = videoMapper.selectById(videoId);
            if (video != null) {
                Integer currentCount = video.getCollectCount();
                if (currentCount != null && currentCount > 0) {
                    video.setCollectCount(currentCount - 1);
                    videoMapper.updateById(video);
                }
            }
            
            // 删除Redis缓存
            try {
                String cacheKey = "video:collect:" + videoId + ":" + userId;
                redisTemplate.delete(cacheKey);
            } catch (Exception e) {
                System.err.println("Redis cache error: " + e.getMessage());
            }
            
            return true;
        }
        
        return false;
    }

    @Override
    public boolean isCollected(Long videoId, Long userId) {
        try {
            // 先查Redis缓存
            String cacheKey = "video:collect:" + videoId + ":" + userId;
            Boolean cached = (Boolean) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return cached;
            }
        } catch (Exception e) {
            System.err.println("Redis cache error: " + e.getMessage());
        }
        
        // 查询数据库
        QueryWrapper<VideoCollect> wrapper = new QueryWrapper<>();
        wrapper.eq("video_id", videoId);
        wrapper.eq("user_id", userId);
        boolean collected = baseMapper.selectCount(wrapper) > 0;
        
        // 写入缓存
        try {
            String cacheKey = "video:collect:" + videoId + ":" + userId;
            redisTemplate.opsForValue().set(cacheKey, collected, 30, TimeUnit.MINUTES);
        } catch (Exception e) {
            System.err.println("Redis cache error: " + e.getMessage());
        }
        
        return collected;
    }

    @Override
    public int getCollectCount(Long videoId) {
        Video video = videoMapper.selectById(videoId);
        if (video != null && video.getCollectCount() != null) {
            return video.getCollectCount();
        }
        return 0;
    }
}
