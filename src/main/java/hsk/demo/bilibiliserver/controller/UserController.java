package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.entity.User;
import hsk.demo.bilibiliserver.service.UserService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/user")
public class UserController {

    @Resource
    private UserService userService;

    @PostMapping("/login")
    public Result<User> login(@RequestBody User user) {
        User loginUser = userService.login(user.getUsername(), user.getPassword());
        return loginUser != null ? Result.success(loginUser) : Result.error("用户名或密码错误");
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        try {
            User registeredUser = userService.register(user);
            return Result.success(registeredUser);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Result<User> getUserInfo(@PathVariable Long id) {
        return Result.success(userService.getUserInfo(id));
    }
}
