package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.entity.VideoLike;

public interface VideoLikeService extends IService<VideoLike> {
    boolean likeVideo(Long videoId, Long userId);
    boolean unlikeVideo(Long videoId, Long userId);
    boolean isLiked(Long videoId, Long userId);
    int getLikeCount(Long videoId);
}
