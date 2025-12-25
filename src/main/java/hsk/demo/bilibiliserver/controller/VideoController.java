package hsk.demo.bilibiliserver.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.dto.VideoDTO;
import hsk.demo.bilibiliserver.entity.Video;
import hsk.demo.bilibiliserver.service.VideoService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/video")
public class VideoController {

    @Resource
    private VideoService videoService;

    @GetMapping("/list")
    public Result<IPage<VideoDTO>> getVideoList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(videoService.getVideoList(page, size, categoryId));
    }

    @GetMapping("/{id}")
    public Result<VideoDTO> getVideoDetail(@PathVariable Long id) {
        videoService.incrementPlayCount(id);
        return Result.success(videoService.getVideoDetail(id));
    }

    @PostMapping("/upload")
    public Result<String> uploadVideo(@RequestBody Video video) {
        boolean success = videoService.uploadVideo(video);
        return success ? Result.success("上传成功") : Result.error("上传失败");
    }

    @GetMapping("/search")
    public Result<IPage<VideoDTO>> searchVideos(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(videoService.searchVideos(keyword, page, size));
    }

    @GetMapping("/recommend")
    public Result<IPage<VideoDTO>> getRecommendVideos(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(videoService.getRecommendVideos(page, size));
    }

    @PutMapping("/{id}")
    public Result<String> updateVideo(@PathVariable Long id, @RequestBody Video video) {
        video.setId(id);
        boolean success = videoService.updateById(video);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteVideo(@PathVariable Long id) {
        boolean success = videoService.removeById(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }
}
