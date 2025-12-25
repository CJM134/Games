package hsk.demo.bilibiliserver.service;

import com.baomidou.mybatisplus.extension.service.IService;
import hsk.demo.bilibiliserver.entity.Category;
import java.util.List;

public interface CategoryService extends IService<Category> {
    List<Category> getAllCategories();
}
