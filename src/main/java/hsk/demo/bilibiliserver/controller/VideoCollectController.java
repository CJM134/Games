package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.service.VideoCollectService;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/video/collect")
public class VideoCollectController {

    @Resource
    private VideoCollectService videoCollectService;

    @PostMapping("/{videoId}")
    public Result<String> collectVideo(@PathVariable Long videoId, @RequestParam Long userId) {
        boolean success = videoCollectService.collectVideo(videoId, userId);
        return success ? Result.success("收藏成功") : Result.error("已经收藏过了");
    }

    @DeleteMapping("/{videoId}")
    public Result<String> uncollectVideo(@PathVariable Long videoId, @RequestParam Long userId) {
        boolean success = videoCollectService.uncollectVideo(videoId, userId);
        return success ? Result.success("取消收藏成功") : Result.error("取消收藏失败");
    }

    @GetMapping("/status/{videoId}")
    public Result<Map<String, Object>> getCollectStatus(@PathVariable Long videoId, @RequestParam Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("isCollected", videoCollectService.isCollected(videoId, userId));
        result.put("collectCount", videoCollectService.getCollectCount(videoId));
        return Result.success(result);
    }
}
