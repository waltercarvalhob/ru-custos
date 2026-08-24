package br.edu.ufma.rucustos.auth.security;

import br.edu.ufma.rucustos.auth.model.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoHoras;

    public JwtService(
            @Value("${ru-custos.jwt.secret}") String segredo,
            @Value("${ru-custos.jwt.expiracao-horas}") long expiracaoHoras) {
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.expiracaoHoras = expiracaoHoras;
    }

    public String gerarToken(Usuario usuario) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expiracaoHoras * 3600_000);

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("nome", usuario.getNome())
                .claim("perfil", usuario.getPerfil().name())
                .claim("userId", usuario.getId())
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(chave)
                .compact();
    }
}
