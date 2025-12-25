package hsk.demo.bilibiliserver.controller;

import hsk.demo.bilibiliserver.common.Result;
import hsk.demo.bilibiliserver.util.VideoUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/file")
public class FileController {

    // 文件上传路径
    private static final String UPLOAD_DIR = "uploads/";
    
    @PostMapping("/upload/video")
    public Result<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }
        
        try {
            // 创建上传目录
            String uploadPath = UPLOAD_DIR + "videos/";
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // 保存视频文件
            Path videoPath = Paths.get(uploadPath + filename);
            Files.write(videoPath, file.getBytes());
            
            // 自动生成封面
            String coverFilename = null;
            int duration = 0;
            try {
                String coverDir = UPLOAD_DIR + "covers/";
                new File(coverDir).mkdirs();
                
                // 从视频中截取封面
                coverFilename = VideoUtil.generateCoverFromVideo(videoPath.toString(), coverDir);
                
                // 获取视频时长
                duration = VideoUtil.getVideoDuration(videoPath.toString());
            } catch (Exception e) {
                System.err.println("生成封面失败: " + e.getMessage());
                e.printStackTrace();
            }
            
            // 返回文件访问URL
            Map<String, String> result = new HashMap<>();
            result.put("videoUrl", "/uploads/videos/" + filename);
            result.put("filename", filename);
            result.put("duration", String.valueOf(duration));
            
            if (coverFilename != null) {
                result.put("coverUrl", "/uploads/covers/" + coverFilename);
            }
            
            return Result.success(result);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }
    
    @PostMapping("/upload/cover")
    public Result<Map<String, String>> uploadCover(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "covers");
    }
    
    private Result<Map<String, String>> uploadFile(MultipartFile file, String subDir) {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }
        
        try {
            // 创建上传目录
            String uploadPath = UPLOAD_DIR + subDir + "/";
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // 保存文件
            Path path = Paths.get(uploadPath + filename);
            Files.write(path, file.getBytes());
            
            // 返回文件访问URL
            Map<String, String> result = new HashMap<>();
            result.put("url", "/uploads/" + subDir + "/" + filename);
            result.put("filename", filename);
            
            return Result.success(result);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }
}
