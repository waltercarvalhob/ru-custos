package br.edu.ufma.rucustos.auth.controller;

import br.edu.ufma.rucustos.auth.dto.LoginRequest;
import br.edu.ufma.rucustos.auth.dto.LoginResponse;
import br.edu.ufma.rucustos.auth.dto.RegistrarRequest;
import br.edu.ufma.rucustos.auth.dto.UsuarioResponse;
import br.edu.ufma.rucustos.auth.model.Usuario;
import br.edu.ufma.rucustos.auth.repository.UsuarioRepository;
import br.edu.ufma.rucustos.auth.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/registrar")
    public UsuarioResponse registrar(@Valid @RequestBody RegistrarRequest requisicao) {
        if (usuarioRepository.existsByEmail(requisicao.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "já existe um usuário com esse email");
        }
        Usuario usuario = new Usuario();
        usuario.setNome(requisicao.nome());
        usuario.setEmail(requisicao.email());
        usuario.setSenhaHash(passwordEncoder.encode(requisicao.senha()));
        usuario = usuarioRepository.save(usuario);
        return UsuarioResponse.de(usuario);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest requisicao) {
        Usuario usuario = usuarioRepository.findByEmail(requisicao.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "email ou senha inválidos"));

        if (!usuario.isAtivo() || !passwordEncoder.matches(requisicao.senha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "email ou senha inválidos");
        }

        String token = jwtService.gerarToken(usuario);
        return new LoginResponse(token, UsuarioResponse.de(usuario));
    }

    @GetMapping("/me")
    public UsuarioResponse me(Principal principal) {
        Usuario usuario = usuarioRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "usuário não encontrado"));
        return UsuarioResponse.de(usuario);
    }
}
