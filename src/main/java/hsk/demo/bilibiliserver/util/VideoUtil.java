package hsk.demo.bilibiliserver.util;

import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.UUID;

public class VideoUtil {
    
    /**
     * 从视频中随机截取一帧作为封面
     * @param videoPath 视频文件路径
     * @param outputDir 输出目录
     * @return 封面图片相对路径
     */
    public static String generateCoverFromVideo(String videoPath, String outputDir) {
        FFmpegFrameGrabber grabber = null;
        try {
            grabber = new FFmpegFrameGrabber(videoPath);
            grabber.start();
            
            // 获取视频总帧数和时长
            int totalFrames = grabber.getLengthInFrames();
            double duration = grabber.getLengthInTime() / 1000000.0; // 转换为秒
            
            // 随机选择一个时间点（避开开头和结尾的5%）
            int startFrame = (int) (totalFrames * 0.05);
            int endFrame = (int) (totalFrames * 0.95);
            int randomFrame = startFrame + (int) (Math.random() * (endFrame - startFrame));
            
            // 跳转到随机帧
            grabber.setFrameNumber(randomFrame);
            Frame frame = grabber.grabImage();
            
            if (frame != null) {
                // 转换为BufferedImage
                Java2DFrameConverter converter = new Java2DFrameConverter();
                BufferedImage bufferedImage = converter.convert(frame);
                
                // 生成文件名
                String filename = UUID.randomUUID().toString() + ".jpg";
                File outputFile = new File(outputDir, filename);
                
                // 确保目录存在
                outputFile.getParentFile().mkdirs();
                
                // 保存图片
                ImageIO.write(bufferedImage, "jpg", outputFile);
                
                return filename;
            }
            
            grabber.stop();
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            if (grabber != null) {
                try {
                    grabber.stop();
                    grabber.release();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
    
    /**
     * 获取视频时长（秒）
     * @param videoPath 视频文件路径
     * @return 视频时长
     */
    public static int getVideoDuration(String videoPath) {
        FFmpegFrameGrabber grabber = null;
        try {
            grabber = new FFmpegFrameGrabber(videoPath);
            grabber.start();
            double duration = grabber.getLengthInTime() / 1000000.0; // 转换为秒
            grabber.stop();
            return (int) Math.ceil(duration);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            if (grabber != null) {
                try {
                    grabber.stop();
                    grabber.release();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
