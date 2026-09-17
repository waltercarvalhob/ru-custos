package br.edu.ufma.rucustos.pagamentos.config;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Exige um JWT valido em toda requisicao /api/**. Este servico nao possui rotas
 * publicas (login e registro ficam no auth-service): o token ja chega validado
 * uma vez pelo gateway, mas cada servico revalida por conta propria.
 */
@Configuration
public class JwtFilterConfig {

    // Mesmos padroes do CorsConfig deste servico. Precisa ser repetido aqui porque este filtro
    // roda antes do DispatcherServlet do Spring MVC - que e quem processa o CorsRegistry - entao
    // quando o filtro rejeita a requisicao (token ausente/invalido) sem chamar chain.doFilter(),
    // a resposta nunca passa pelo mecanismo de CORS do MVC e sai sem o header
    // Access-Control-Allow-Origin. O navegador entao trata isso como falha de rede (igual a um
    // servico dormindo no plano gratuito do Render), mesmo o servico respondendo normalmente.
    private static final CorsConfiguration CORS = new CorsConfiguration();
    static {
        CORS.setAllowedOriginPatterns(List.of("https://*.onrender.com", "http://localhost:*"));
    }

    @Bean
    public FilterRegistrationBean<Filter> jwtFilterRegistration(
            @Value("${ru-custos.jwt.secret}") String segredo) {
        SecretKey chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));

        Filter filtro = (ServletRequest req, ServletResponse res, FilterChain chain) -> {
            HttpServletRequest request = (HttpServletRequest) req;
            HttpServletResponse response = (HttpServletResponse) res;

            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                chain.doFilter(req, res);
                return;
            }

            String header = request.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                naoAutorizado(request, response, "token ausente");
                return;
            }

            try {
                Jwts.parser().verifyWith(chave).build().parseSignedClaims(header.substring(7));
            } catch (JwtException | IllegalArgumentException ex) {
                naoAutorizado(request, response, "token inválido ou expirado");
                return;
            }

            chain.doFilter(req, res);
        };

        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>(filtro);
        registration.addUrlPatterns("/api/*");
        registration.setOrder(1);
        return registration;
    }

    private static void naoAutorizado(HttpServletRequest request, HttpServletResponse response, String mensagem)
            throws IOException {
        String origem = request.getHeader("Origin");
        if (origem != null && CORS.checkOrigin(origem) != null) {
            response.setHeader("Access-Control-Allow-Origin", origem);
            response.setHeader("Vary", "Origin");
        }
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + mensagem + "\"}");
    }
}
