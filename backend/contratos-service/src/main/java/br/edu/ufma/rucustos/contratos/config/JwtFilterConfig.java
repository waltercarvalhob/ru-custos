package br.edu.ufma.rucustos.contratos.config;

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

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Exige um JWT valido em toda requisicao /api/**. Este servico nao possui rotas
 * publicas (login e registro ficam no auth-service): o token ja chega validado
 * uma vez pelo gateway, mas cada servico revalida por conta propria.
 */
@Configuration
public class JwtFilterConfig {

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
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "token ausente");
                return;
            }

            try {
                Jwts.parser().verifyWith(chave).build().parseSignedClaims(header.substring(7));
            } catch (JwtException | IllegalArgumentException ex) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "token inválido ou expirado");
                return;
            }

            chain.doFilter(req, res);
        };

        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>(filtro);
        registration.addUrlPatterns("/api/*");
        registration.setOrder(1);
        return registration;
    }
}
