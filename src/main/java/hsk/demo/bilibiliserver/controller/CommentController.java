package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.dto.CommentDTO;
import hsk.demo.bilibiliserver.entity.Comment;
import hsk.demo.bilibiliserver.service.CommentService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
public class CommentController {

    @Resource
    private CommentService commentService;

    @GetMapping("/list/{videoId}")
    public Result<List<CommentDTO>> getComments(@PathVariable Long videoId) {
        return Result.success(commentService.getCommentsByVideoId(videoId));
    }

    @PostMapping("/add")
    public Result<String> addComment(@RequestBody Comment comment) {
        boolean success = commentService.addComment(comment);
        return success ? Result.success("评论成功") : Result.error("评论失败");
    }

    @DeleteMapping("/{id}")
    public Result<String> deleteComment(@PathVariable Long id) {
        boolean success = commentService.removeById(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }
}
