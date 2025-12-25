package hsk.demo.bilibiliserver.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.dto.MomentDTO;
import hsk.demo.bilibiliserver.dto.MomentCommentDTO;
import hsk.demo.bilibiliserver.entity.Moment;
import hsk.demo.bilibiliserver.entity.MomentComment;
import hsk.demo.bilibiliserver.service.MomentService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moment")
public class MomentController {

    @Resource
    private MomentService momentService;

    @GetMapping("/list")
    public Result<IPage<MomentDTO>> getMomentList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long userId) {
        return Result.success(momentService.getMomentList(page, size, userId));
    }

    @GetMapping("/{id}")
    public Result<MomentDTO> getMomentDetail(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        return Result.success(momentService.getMomentDetail(id, userId));
    }

    @PostMapping("/publish")
    public Result<String> publishMoment(@RequestBody Moment moment) {
        boolean success = momentService.publishMoment(moment);
        if (success) {
            return Result.success("发布成功");
        } else {
            return Result.error("发布失败");
        }
    }

    @PostMapping("/{id}/like")
    public Result<String> likeMoment(@PathVariable Long id, @RequestParam Long userId) {
        boolean success = momentService.likeMoment(id, userId);
        if (success) {
            return Result.success("点赞成功");
        } else {
            return Result.error("已经点赞过了");
        }
    }

    @DeleteMapping("/{id}/like")
    public Result<String> unlikeMoment(@PathVariable Long id, @RequestParam Long userId) {
        boolean success = momentService.unlikeMoment(id, userId);
        if (success) {
            return Result.success("取消点赞");
        } else {
            return Result.error("取消失败");
        }
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteMoment(@PathVariable Long id) {
        boolean success = momentService.removeById(id);
        if (success) {
            return Result.success("删除成功");
        } else {
            return Result.error("删除失败");
        }
    }

    @GetMapping("/{id}/comments")
    public Result<List<MomentCommentDTO>> getComments(@PathVariable Long id) {
        return Result.success(momentService.getComments(id));
    }

    @PostMapping("/{id}/comment")
    public Result<String> addComment(@PathVariable Long id, @RequestBody MomentComment comment) {
        comment.setMomentId(id);
        boolean success = momentService.addComment(comment);
        if (success) {
            return Result.success("评论成功");
        } else {
            return Result.error("评论失败");
        }
    }
}
