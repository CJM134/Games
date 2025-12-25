package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.entity.User;
import hsk.demo.bilibiliserver.mapper.UserMapper;
import hsk.demo.bilibiliserver.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public User login(String username, String password) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        User user = baseMapper.selectOne(wrapper);
        if (user != null && user.getPassword().equals(DigestUtils.md5DigestAsHex(password.getBytes()))) {
            return user;
        }
        return null;
    }

    @Override
    public User register(User user) {
        // 检查用户名是否已存在
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", user.getUsername());
        User existUser = baseMapper.selectOne(wrapper);
        if (existUser != null) {
            throw new RuntimeException("用户名已存在");
        }
        
        user.setPassword(DigestUtils.md5DigestAsHex(user.getPassword().getBytes()));
        user.setAvatar("/images/default.png");
        user.setSignature("这个人很懒，什么都没留下");
        // 如果没有设置昵称，使用用户名作为昵称
        if (user.getNickname() == null || user.getNickname().trim().isEmpty()) {
            user.setNickname(user.getUsername());
        }
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        baseMapper.insert(user);
        return user;
    }

    @Override
    public User getUserInfo(Long userId) {
        return baseMapper.selectById(userId);
    }
}
