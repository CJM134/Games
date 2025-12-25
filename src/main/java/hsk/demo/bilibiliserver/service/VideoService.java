package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.dto.VideoDTO;
import hsk.demo.bilibiliserver.entity.Video;

public interface VideoService extends IService<Video> {
    IPage<VideoDTO> getVideoList(int page, int size, Long categoryId);
    VideoDTO getVideoDetail(Long videoId);
    boolean uploadVideo(Video video);
    boolean incrementPlayCount(Long videoId);
    IPage<VideoDTO> searchVideos(String keyword, int page, int size);
    IPage<VideoDTO> getRecommendVideos(int page, int size);
}
