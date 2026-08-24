package br.edu.ufma.rucustos.gateway.config;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Valida o JWT cedo, antes de rotear para os servicos downstream, para responder 401
 * sem depender de cada servico. As rotas de login/registro ficam liberadas.
 */
@Configuration
public class JwtGatewayFilter {

    private static final List<String> ROTAS_PUBLICAS = List.of("/api/auth/login", "/api/auth/registrar");

    @Bean
    public FilterRegistrationBean<Filter> jwtFilterRegistration(
            @Value("${ru-custos.jwt.secret}") String segredo) {
        SecretKey chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));

        Filter filtro = (ServletRequest req, ServletResponse res, FilterChain chain) -> {
            HttpServletRequest request = (HttpServletRequest) req;
            HttpServletResponse response = (HttpServletResponse) res;
            String caminho = request.getRequestURI();

            if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || ROTAS_PUBLICAS.contains(caminho)) {
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
