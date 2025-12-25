package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.entity.Category;
import hsk.demo.bilibiliserver.service.CategoryService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Resource
    private CategoryService categoryService;

    @GetMapping("/list")
    public Result<List<Category>> getAllCategories() {
        return Result.success(categoryService.getAllCategories());
    }
}
