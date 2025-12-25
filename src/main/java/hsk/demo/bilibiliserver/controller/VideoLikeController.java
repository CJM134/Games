package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.service.VideoLikeService;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/video/like")
public class VideoLikeController {

    @Resource
    private VideoLikeService videoLikeService;

    @PostMapping("/{videoId}")
    public Result<String> likeVideo(@PathVariable Long videoId, @RequestParam Long userId) {
        boolean success = videoLikeService.likeVideo(videoId, userId);
        return success ? Result.success("点赞成功") : Result.error("已经点赞过了");
    }

    @DeleteMapping("/{videoId}")
    public Result<String> unlikeVideo(@PathVariable Long videoId, @RequestParam Long userId) {
        boolean success = videoLikeService.unlikeVideo(videoId, userId);
        return success ? Result.success("取消点赞成功") : Result.error("取消点赞失败");
    }

    @GetMapping("/status/{videoId}")
    public Result<Map<String, Object>> getLikeStatus(@PathVariable Long videoId, @RequestParam Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("isLiked", videoLikeService.isLiked(videoId, userId));
        result.put("likeCount", videoLikeService.getLikeCount(videoId));
        return Result.success(result);
    }
}
