package hsk.demo.bilibiliserver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源访问路径
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        
        // 配置默认图片访问路径 - 指向项目根目录的images文件夹
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:images/");
    }
}
