package br.edu.ufma.rucustos.contratos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * So ativo no perfil "render": la o frontend chama este servico diretamente (sem gateway),
 * entao o CORS precisa ser tratado aqui. Nos demais perfis o gateway ja cuida disso.
 */
@Configuration
@Profile("render")
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("https://*.onrender.com", "http://localhost:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
