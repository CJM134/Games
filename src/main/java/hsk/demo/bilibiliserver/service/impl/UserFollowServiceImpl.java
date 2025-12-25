package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.dto.UserProfileDTO;
import hsk.demo.bilibiliserver.entity.User;
import hsk.demo.bilibiliserver.entity.UserFollow;
import hsk.demo.bilibiliserver.mapper.UserFollowMapper;
import hsk.demo.bilibiliserver.mapper.UserMapper;
import hsk.demo.bilibiliserver.service.NotificationService;
import hsk.demo.bilibiliserver.service.UserFollowService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserFollowServiceImpl extends ServiceImpl<UserFollowMapper, UserFollow> implements UserFollowService {

    @Resource
    private UserMapper userMapper;
    
    @Resource
    private NotificationService notificationService;

    @Override
    @Transactional
    public boolean followUser(Long userId, Long followUserId) {
        if (userId.equals(followUserId)) {
            return false; // 不能关注自己
        }
        
        if (isFollowed(userId, followUserId)) {
            return false; // 已经关注过了
        }
        
        // 添加关注记录
        UserFollow userFollow = new UserFollow();
        userFollow.setUserId(userId);
        userFollow.setFollowUserId(followUserId);
        userFollow.setCreateTime(LocalDateTime.now());
        baseMapper.insert(userFollow);
        
        // 更新用户关注数
        User user = userMapper.selectById(userId);
        if (user != null) {
            Integer count = user.getFollowCount();
            user.setFollowCount(count != null ? count + 1 : 1);
            userMapper.updateById(user);
        }
        
        // 更新被关注用户的粉丝数
        User followUser = userMapper.selectById(followUserId);
        if (followUser != null) {
            Integer count = followUser.getFansCount();
            followUser.setFansCount(count != null ? count + 1 : 1);
            userMapper.updateById(followUser);
        }
        
        // 创建关注通知
        notificationService.createNotification(
            followUserId,
            userId,
            "follow",
            "关注了你",
            null
        );
        
        return true;
    }

    @Override
    @Transactional
    public boolean unfollowUser(Long userId, Long followUserId) {
        QueryWrapper<UserFollow> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("follow_user_id", followUserId);
        int deleted = baseMapper.delete(wrapper);
        
        if (deleted > 0) {
            // 更新用户关注数
            User user = userMapper.selectById(userId);
            if (user != null) {
                Integer count = user.getFollowCount();
                if (count != null && count > 0) {
                    user.setFollowCount(count - 1);
                    userMapper.updateById(user);
                }
            }
            
            // 更新被关注用户的粉丝数
            User followUser = userMapper.selectById(followUserId);
            if (followUser != null) {
                Integer count = followUser.getFansCount();
                if (count != null && count > 0) {
                    followUser.setFansCount(count - 1);
                    userMapper.updateById(followUser);
                }
            }
            
            return true;
        }
        
        return false;
    }

    @Override
    public boolean isFollowed(Long userId, Long followUserId) {
        QueryWrapper<UserFollow> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("follow_user_id", followUserId);
        return baseMapper.selectCount(wrapper) > 0;
    }

    @Override
    public List<UserProfileDTO> getFollowList(Long userId) {
        QueryWrapper<UserFollow> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        List<UserFollow> follows = baseMapper.selectList(wrapper);
        
        List<UserProfileDTO> result = new ArrayList<>();
        for (UserFollow follow : follows) {
            User user = userMapper.selectById(follow.getFollowUserId());
            if (user != null) {
                result.add(convertToDTO(user, userId));
            }
        }
        
        return result;
    }

    @Override
    public List<UserProfileDTO> getFansList(Long userId) {
        QueryWrapper<UserFollow> wrapper = new QueryWrapper<>();
        wrapper.eq("follow_user_id", userId);
        List<UserFollow> fans = baseMapper.selectList(wrapper);
        
        List<UserProfileDTO> result = new ArrayList<>();
        for (UserFollow fan : fans) {
            User user = userMapper.selectById(fan.getUserId());
            if (user != null) {
                result.add(convertToDTO(user, userId));
            }
        }
        
        return result;
    }
    
    private UserProfileDTO convertToDTO(User user, Long currentUserId) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setAvatar(user.getAvatar());
        dto.setSignature(user.getSignature());
        dto.setGender(user.getGender());
        dto.setBirthday(user.getBirthday());
        dto.setCreateTime(user.getCreateTime());
        dto.setFollowCount(user.getFollowCount() != null ? user.getFollowCount() : 0);
        dto.setFansCount(user.getFansCount() != null ? user.getFansCount() : 0);
        dto.setVideoCount(user.getVideoCount() != null ? user.getVideoCount() : 0);
        dto.setIsFollowed(isFollowed(currentUserId, user.getId()));
        return dto;
    }
}
