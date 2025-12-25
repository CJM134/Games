package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.dto.MomentCommentDTO;
import hsk.demo.bilibiliserver.dto.MomentDTO;
import hsk.demo.bilibiliserver.entity.Moment;
import hsk.demo.bilibiliserver.entity.MomentComment;

import java.util.List;

public interface MomentService extends IService<Moment> {
    IPage<MomentDTO> getMomentList(int page, int size, Long userId);
    MomentDTO getMomentDetail(Long momentId, Long currentUserId);
    boolean publishMoment(Moment moment);
    boolean likeMoment(Long momentId, Long userId);
    boolean unlikeMoment(Long momentId, Long userId);
    boolean isLiked(Long momentId, Long userId);
    List<MomentCommentDTO> getComments(Long momentId);
    boolean addComment(MomentComment comment);
}
