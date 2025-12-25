package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hsk.demo.bilibiliserver.dto.MomentCommentDTO;
import hsk.demo.bilibiliserver.dto.MomentDTO;
import hsk.demo.bilibiliserver.entity.Moment;
import hsk.demo.bilibiliserver.entity.MomentComment;
import hsk.demo.bilibiliserver.entity.MomentLike;
import hsk.demo.bilibiliserver.mapper.MomentCommentMapper;
import hsk.demo.bilibiliserver.mapper.MomentLikeMapper;
import hsk.demo.bilibiliserver.mapper.MomentMapper;
import hsk.demo.bilibiliserver.service.MomentService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MomentServiceImpl extends ServiceImpl<MomentMapper, Moment> implements MomentService {

    @Resource
    private MomentLikeMapper momentLikeMapper;
    
    @Resource
    private MomentCommentMapper momentCommentMapper;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public IPage<MomentDTO> getMomentList(int page, int size, Long userId) {
        Page<MomentDTO> pageParam = new Page<>(page, size);
        IPage<MomentDTO> result = baseMapper.selectMomentPage(pageParam);
        
        // 解析图片JSON
        result.getRecords().forEach(moment -> {
            try {
                if (moment.getImages() != null && !moment.getImages().isEmpty()) {
                    // 这里images字段在DTO中是List<String>，但数据库中是String
                    // 需要特殊处理
                }
                // 检查是否已点赞
                if (userId != null) {
                    moment.setIsLiked(isLiked(moment.getId(), userId));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        
        return result;
    }

    @Override
    public MomentDTO getMomentDetail(Long momentId, Long currentUserId) {
        MomentDTO moment = baseMapper.selectMomentById(momentId);
        if (moment != null && currentUserId != null) {
            moment.setIsLiked(isLiked(momentId, currentUserId));
        }
        return moment;
    }

    @Override
    public boolean publishMoment(Moment moment) {
        moment.setLikeCount(0);
        moment.setCommentCount(0);
        moment.setShareCount(0);
        moment.setCreateTime(LocalDateTime.now());
        moment.setUpdateTime(LocalDateTime.now());
        return baseMapper.insert(moment) > 0;
    }

    @Override
    public boolean likeMoment(Long momentId, Long userId) {
        // 检查是否已点赞
        if (isLiked(momentId, userId)) {
            return false;
        }
        
        // 添加点赞记录
        MomentLike like = new MomentLike();
        like.setMomentId(momentId);
        like.setUserId(userId);
        like.setCreateTime(LocalDateTime.now());
        
        if (momentLikeMapper.insert(like) > 0) {
            // 更新点赞数
            Moment moment = baseMapper.selectById(momentId);
            if (moment != null) {
                moment.setLikeCount(moment.getLikeCount() + 1);
                baseMapper.updateById(moment);
            }
            return true;
        }
        return false;
    }

    @Override
    public boolean unlikeMoment(Long momentId, Long userId) {
        QueryWrapper<MomentLike> wrapper = new QueryWrapper<>();
        wrapper.eq("moment_id", momentId);
        wrapper.eq("user_id", userId);
        
        if (momentLikeMapper.delete(wrapper) > 0) {
            // 更新点赞数
            Moment moment = baseMapper.selectById(momentId);
            if (moment != null && moment.getLikeCount() > 0) {
                moment.setLikeCount(moment.getLikeCount() - 1);
                baseMapper.updateById(moment);
            }
            return true;
        }
        return false;
    }

    @Override
    public boolean isLiked(Long momentId, Long userId) {
        QueryWrapper<MomentLike> wrapper = new QueryWrapper<>();
        wrapper.eq("moment_id", momentId);
        wrapper.eq("user_id", userId);
        return momentLikeMapper.selectCount(wrapper) > 0;
    }

    @Override
    public List<MomentCommentDTO> getComments(Long momentId) {
        return momentCommentMapper.selectCommentsByMomentId(momentId);
    }

    @Override
    public boolean addComment(MomentComment comment) {
        comment.setCreateTime(LocalDateTime.now());
        if (momentCommentMapper.insert(comment) > 0) {
            // 更新评论数
            Moment moment = baseMapper.selectById(comment.getMomentId());
            if (moment != null) {
                moment.setCommentCount(moment.getCommentCount() + 1);
                baseMapper.updateById(moment);
            }
            return true;
        }
        return false;
    }

}
