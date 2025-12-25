package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.entity.Category;
import hsk.demo.bilibiliserver.mapper.CategoryMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Resource
    private CategoryMapper categoryMapper;

    @GetMapping("/categories")
    public List<Category> testCategories() {
        List<Category> categories = categoryMapper.selectList(null);
        // 打印调试信息
        for (Category cat : categories) {
            System.out.println("Category: " + cat.getName() + ", Icon: " + cat.getIcon());
        }
        return categories;
    }
}
