package hsk.demo.bilibiliserver.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import hsk.demo.bilibiliserver.entity.Category;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
}
