package hsk.demo.bilibiliserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.dto.UserProfileDTO;
import hsk.demo.bilibiliserver.entity.User;
import hsk.demo.bilibiliserver.entity.Video;
import hsk.demo.bilibiliserver.entity.VideoCollect;
import hsk.demo.bilibiliserver.mapper.UserMapper;
import hsk.demo.bilibiliserver.mapper.VideoCollectMapper;
import hsk.demo.bilibiliserver.mapper.VideoMapper;
import hsk.demo.bilibiliserver.service.UserFollowService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.Resource;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/profile")
public class UserProfileController {

    @Resource
    private UserMapper userMapper;
    
    @Resource
    private VideoMapper videoMapper;
    
    @Resource
    private VideoCollectMapper videoCollectMapper;
    
    @Resource
    private UserFollowService userFollowService;

    // 获取用户资料
    @GetMapping("/{userId}")
    public Result<UserProfileDTO> getUserProfile(@PathVariable Long userId, @RequestParam(required = false) Long currentUserId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
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
        
        // 实时统计投稿数
        QueryWrapper<Video> videoWrapper = new QueryWrapper<>();
        videoWrapper.eq("user_id", userId);
        videoWrapper.eq("status", 1);
        Long videoCount = videoMapper.selectCount(videoWrapper);
        dto.setVideoCount(videoCount.intValue());
        
        // 判断是否已关注
        if (currentUserId != null && !currentUserId.equals(userId)) {
            dto.setIsFollowed(userFollowService.isFollowed(currentUserId, userId));
        } else {
            dto.setIsFollowed(false);
        }
        
        return Result.success(dto);
    }

    // 获取用户投稿视频列表
    @GetMapping("/{userId}/videos")
    public Result<List<Video>> getUserVideos(@PathVariable Long userId) {
        QueryWrapper<Video> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("status", 1);
        wrapper.orderByDesc("create_time");
        List<Video> videos = videoMapper.selectList(wrapper);
        return Result.success(videos);
    }

    // 获取用户收藏视频列表
    @GetMapping("/{userId}/collects")
    public Result<List<Video>> getUserCollects(@PathVariable Long userId) {
        QueryWrapper<VideoCollect> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("create_time");
        List<VideoCollect> collects = videoCollectMapper.selectList(wrapper);
        
        List<Video> videos = new ArrayList<>();
        for (VideoCollect collect : collects) {
            Video video = videoMapper.selectById(collect.getVideoId());
            if (video != null && video.getStatus() == 1) {
                videos.add(video);
            }
        }
        
        return Result.success(videos);
    }

    // 更新用户资料
    @PutMapping("/{userId}")
    public Result<String> updateProfile(@PathVariable Long userId, @RequestBody User user) {
        User existUser = userMapper.selectById(userId);
        if (existUser == null) {
            return Result.error("用户不存在");
        }
        
        // 只更新允许修改的字段
        if (user.getNickname() != null) {
            existUser.setNickname(user.getNickname());
        }
        if (user.getSignature() != null) {
            existUser.setSignature(user.getSignature());
        }
        if (user.getGender() != null) {
            existUser.setGender(user.getGender());
        }
        if (user.getBirthday() != null) {
            existUser.setBirthday(user.getBirthday());
        }
        
        userMapper.updateById(existUser);
        return Result.success("更新成功");
    }

    // 上传头像
    @PostMapping("/{userId}/avatar")
    public Result<Map<String, String>> uploadAvatar(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        try {
            String uploadPath = "uploads/avatars/";
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            Path path = Paths.get(uploadPath + filename);
            Files.write(path, file.getBytes());
            
            String avatarUrl = "/uploads/avatars/" + filename;
            
            // 更新用户头像
            User user = userMapper.selectById(userId);
            if (user != null) {
                user.setAvatar(avatarUrl);
                userMapper.updateById(user);
            }
            
            Map<String, String> result = new HashMap<>();
            result.put("avatarUrl", avatarUrl);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    // 关注用户
    @PostMapping("/follow/{followUserId}")
    public Result<String> followUser(@RequestParam Long userId, @PathVariable Long followUserId) {
        boolean success = userFollowService.followUser(userId, followUserId);
        return success ? Result.success("关注成功") : Result.error("关注失败");
    }

    // 取消关注
    @DeleteMapping("/follow/{followUserId}")
    public Result<String> unfollowUser(@RequestParam Long userId, @PathVariable Long followUserId) {
        boolean success = userFollowService.unfollowUser(userId, followUserId);
        return success ? Result.success("取消关注成功") : Result.error("取消关注失败");
    }

    // 获取关注列表
    @GetMapping("/{userId}/follows")
    public Result<List<UserProfileDTO>> getFollowList(@PathVariable Long userId) {
        return Result.success(userFollowService.getFollowList(userId));
    }

    // 获取粉丝列表
    @GetMapping("/{userId}/fans")
    public Result<List<UserProfileDTO>> getFansList(@PathVariable Long userId) {
        return Result.success(userFollowService.getFansList(userId));
    }
}
