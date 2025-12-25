package hsk.demo.bilibiliserver;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("hsk.demo.bilibiliserver.mapper")
public class BilibiliServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(BilibiliServerApplication.class, args);
    }

}
