package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.dto.VideoDTO;
import hsk.demo.bilibiliserver.entity.Video;
import hsk.demo.bilibiliserver.mapper.VideoMapper;
import hsk.demo.bilibiliserver.service.VideoService;
import jakarta.annotation.Resource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class VideoServiceImpl extends ServiceImpl<VideoMapper, Video> implements VideoService {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public IPage<VideoDTO> getVideoList(int page, int size, Long categoryId) {
        Page<VideoDTO> pageParam = new Page<>(page, size);
        return baseMapper.selectVideoPage(pageParam, categoryId);
    }

    @Override
    public VideoDTO getVideoDetail(Long videoId) {
        // 直接从数据库获取最新数据，不使用缓存
        // 因为播放量、点赞数等会频繁变化
        return baseMapper.selectVideoWithUser(videoId);
    }

    @Override
    public boolean uploadVideo(Video video) {
        video.setCreateTime(LocalDateTime.now());
        video.setUpdateTime(LocalDateTime.now());
        video.setStatus(1);
        return baseMapper.insert(video) > 0;
    }

    @Override
    public boolean incrementPlayCount(Long videoId) {
        Video video = baseMapper.selectById(videoId);
        if (video != null) {
            video.setPlayCount(video.getPlayCount() + 1);
            boolean success = baseMapper.updateById(video) > 0;
            
            // 清除缓存（如果有的话）
            if (success) {
                try {
                    String cacheKey = "video:" + videoId;
                    redisTemplate.delete(cacheKey);
                } catch (Exception e) {
                    System.err.println("清除缓存失败: " + e.getMessage());
                }
            }
            
            return success;
        }
        return false;
    }

    @Override
    public IPage<VideoDTO> searchVideos(String keyword, int page, int size) {
        Page<VideoDTO> pageParam = new Page<>(page, size);
        return baseMapper.searchVideoPage(pageParam, keyword);
    }

    @Override
    public IPage<VideoDTO> getRecommendVideos(int page, int size) {
        // 获取最近的视频（最多100条）
        List<VideoDTO> allVideos = baseMapper.selectRecentVideos();
        
        // 只取前100条
        if (allVideos.size() > 100) {
            allVideos = allVideos.subList(0, 100);
        }
        
        // 计算热度分数并排序
        allVideos.forEach(video -> {
            double score = calculateHotScore(video);
            video.setHotScore(score);
        });
        
        // 按热度分数排序
        allVideos.sort((v1, v2) -> 
            Double.compare(v2.getHotScore(), v1.getHotScore())
        );
        
        // 分页返回
        int start = (page - 1) * size;
        int end = Math.min(start + size, allVideos.size());
        
        Page<VideoDTO> result = new Page<>(page, size);
        result.setTotal(allVideos.size());
        
        if (start < allVideos.size()) {
            result.setRecords(allVideos.subList(start, end));
        }
        
        return result;
    }
    
    /**
     * 计算视频热度分数
     * 算法：热度 = (播放量 * 1 + 点赞数 * 10 + 收藏数 * 15 + 评论数 * 20) * 时间衰减系数
     * 时间衰减：越新的视频权重越高
     */
    private double calculateHotScore(VideoDTO video) {
        // 基础分数
        double playScore = video.getPlayCount() * 1.0;
        double likeScore = video.getLikeCount() * 10.0;
        double collectScore = video.getCollectCount() * 15.0;
        double commentScore = video.getCommentCount() * 20.0;
        
        double baseScore = playScore + likeScore + collectScore + commentScore;
        
        // 时间衰减系数（7天内的视频权重更高）
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createTime = video.getCreateTime();
        long hoursDiff = java.time.Duration.between(createTime, now).toHours();
        
        // 时间衰减公式：1 / (1 + hoursDiff / 24)
        // 新视频（1天内）系数接近1，7天后系数约0.125
        double timeDecay = 1.0 / (1.0 + hoursDiff / 24.0);
        
        // 最终分数
        return baseScore * (0.3 + 0.7 * timeDecay);
    }
}
