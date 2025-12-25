package hsk.demo.bilibiliserver.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import hsk.demo.bilibiliserver.entity.Category;
import hsk.demo.bilibiliserver.mapper.CategoryMapper;
import hsk.demo.bilibiliserver.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Category> getAllCategories() {
        QueryWrapper<Category> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("sort");
        return baseMapper.selectList(wrapper);
    }
}
