package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.entity.User;

public interface UserService extends IService<User> {
    User login(String username, String password);
    User register(User user);
    User getUserInfo(Long userId);
}
