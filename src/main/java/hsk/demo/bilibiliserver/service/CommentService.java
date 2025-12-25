package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.dto.CommentDTO;
import hsk.demo.bilibiliserver.entity.Comment;
import java.util.List;

public interface CommentService extends IService<Comment> {
    List<CommentDTO> getCommentsByVideoId(Long videoId);
    boolean addComment(Comment comment);
}
