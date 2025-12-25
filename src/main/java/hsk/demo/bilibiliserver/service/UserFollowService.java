package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.dto.UserProfileDTO;
import hsk.demo.bilibiliserver.entity.UserFollow;

import java.util.List;

public interface UserFollowService extends IService<UserFollow> {
    boolean followUser(Long userId, Long followUserId);
    boolean unfollowUser(Long userId, Long followUserId);
    boolean isFollowed(Long userId, Long followUserId);
    List<UserProfileDTO> getFollowList(Long userId);
    List<UserProfileDTO> getFansList(Long userId);
}
