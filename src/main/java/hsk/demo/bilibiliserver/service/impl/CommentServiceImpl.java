package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.dto.CommentDTO;
import hsk.demo.bilibiliserver.entity.Comment;
import hsk.demo.bilibiliserver.entity.User;
import hsk.demo.bilibiliserver.entity.Video;
import hsk.demo.bilibiliserver.mapper.CommentMapper;
import hsk.demo.bilibiliserver.mapper.UserMapper;
import hsk.demo.bilibiliserver.mapper.VideoMapper;
import hsk.demo.bilibiliserver.service.CommentService;
import hsk.demo.bilibiliserver.service.NotificationService;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Resource
    private UserMapper userMapper;
    
    @Resource
    private VideoMapper videoMapper;
    
    @Resource
    private NotificationService notificationService;

    @Override
    public List<CommentDTO> getCommentsByVideoId(Long videoId) {
        QueryWrapper<Comment> wrapper = new QueryWrapper<>();
        wrapper.eq("video_id", videoId);
        wrapper.orderByDesc("create_time");
        List<Comment> allComments = baseMapper.selectList(wrapper);
        
        // 分离主评论和回复
        List<CommentDTO> mainComments = new ArrayList<>();
        List<CommentDTO> replyComments = new ArrayList<>();
        
        for (Comment comment : allComments) {
            CommentDTO dto = convertToDTO(comment);
            
            if (comment.getParentId() == null || comment.getParentId() == 0) {
                // 主评论
                dto.setReplies(new ArrayList<>());
                dto.setReplyCount(0);
                mainComments.add(dto);
            } else {
                // 回复评论
                replyComments.add(dto);
            }
        }
        
        // 将回复关联到主评论
        for (CommentDTO mainComment : mainComments) {
            for (CommentDTO reply : replyComments) {
                if (reply.getParentId().equals(mainComment.getId())) {
                    mainComment.getReplies().add(reply);
                    mainComment.setReplyCount(mainComment.getReplies().size());
                }
            }
        }
        
        return mainComments;
    }
    
    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setVideoId(comment.getVideoId());
        dto.setUserId(comment.getUserId());
        dto.setParentId(comment.getParentId());
        dto.setContent(comment.getContent());
        dto.setLikeCount(comment.getLikeCount());
        dto.setCreateTime(comment.getCreateTime());
        
        // 获取用户信息
        User user = userMapper.selectById(comment.getUserId());
        if (user != null) {
            dto.setUserName(user.getNickname() != null ? user.getNickname() : user.getUsername());
            dto.setUserAvatar(user.getAvatar());
        }
        
        return dto;
    }

    @Override
    public boolean addComment(Comment comment) {
        comment.setCreateTime(LocalDateTime.now());
        comment.setLikeCount(0);
        boolean success = baseMapper.insert(comment) > 0;
        
        if (success) {
            // 获取视频信息
            Video video = videoMapper.selectById(comment.getVideoId());
            if (video != null && !video.getUserId().equals(comment.getUserId())) {
                // 创建评论通知（不给自己发通知）
                notificationService.createNotification(
                    video.getUserId(),
                    comment.getUserId(),
                    "comment",
                    "评论了你的视频",
                    comment.getVideoId()
                );
            }
        }
        
        return success;
    }
}
