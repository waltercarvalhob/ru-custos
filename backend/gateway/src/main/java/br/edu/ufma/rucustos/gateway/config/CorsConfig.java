package br.edu.ufma.rucustos.gateway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Padroes cobrem localhost e as faixas de IP de rede privada (LAN), para o frontend
        // ser acessivel por outros computadores/celulares na mesma rede, alem desta maquina.
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "http://192.168.*.*:*",
                        "http://10.*.*.*:*",
                        "http://172.16.*.*:*", "http://172.17.*.*:*", "http://172.18.*.*:*", "http://172.19.*.*:*",
                        "http://172.20.*.*:*", "http://172.21.*.*:*", "http://172.22.*.*:*", "http://172.23.*.*:*",
                        "http://172.24.*.*:*", "http://172.25.*.*:*", "http://172.26.*.*:*", "http://172.27.*.*:*",
                        "http://172.28.*.*:*", "http://172.29.*.*:*", "http://172.30.*.*:*", "http://172.31.*.*:*",
                        "https://*.onrender.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
