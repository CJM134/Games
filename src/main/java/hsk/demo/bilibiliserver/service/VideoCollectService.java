package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.entity.VideoCollect;

public interface VideoCollectService extends IService<VideoCollect> {
    boolean collectVideo(Long videoId, Long userId);
    boolean uncollectVideo(Long videoId, Long userId);
    boolean isCollected(Long videoId, Long userId);
    int getCollectCount(Long videoId);
}
