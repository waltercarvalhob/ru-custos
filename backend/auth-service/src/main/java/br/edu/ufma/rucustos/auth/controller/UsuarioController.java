package br.edu.ufma.rucustos.auth.controller;

import br.edu.ufma.rucustos.auth.dto.AtualizarUsuarioRequest;
import br.edu.ufma.rucustos.auth.dto.UsuarioResponse;
import br.edu.ufma.rucustos.auth.model.Usuario;
import br.edu.ufma.rucustos.auth.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

/** Restrito a ADMIN em SecurityConfig. */
@RestController
@RequestMapping("/api/auth/usuarios")
public class UsuarioController {

    // Contas aguardando aprovacao (ativo = false) aparecem primeiro.
    private static final Sort ORDEM = Sort.by("ativo", "nome");

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll(ORDEM).stream().map(UsuarioResponse::de).toList();
    }

    /** Cadastro feito pelo ADMIN: ja define perfil, situacao e senha (nao passa pela aprovacao). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse criar(@Valid @RequestBody AtualizarUsuarioRequest requisicao) {
        if (requisicao.senha() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "informe a senha do novo usuário");
        }
        String email = normalizarEmail(requisicao.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "já existe um usuário com esse email");
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPerfil(requisicao.perfil());
        usuario.setAtivo(requisicao.ativo());
        usuario.setSenhaHash(passwordEncoder.encode(requisicao.senha()));
        preencherDados(usuario, requisicao);
        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    @PutMapping("/{id}")
    public UsuarioResponse atualizar(@PathVariable Long id, @Valid @RequestBody AtualizarUsuarioRequest requisicao,
                                     Principal principal) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "usuário não encontrado"));
        String email = normalizarEmail(requisicao.email());
        boolean propriaConta = usuario.getEmail().equalsIgnoreCase(principal.getName());

        if (propriaConta) {
            // Evita que o sistema fique sem administrador ou que a sessao atual perca a validade.
            if (requisicao.perfil() != usuario.getPerfil() || !requisicao.ativo()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "não é possível mudar o perfil nem desativar a própria conta");
            }
            if (!email.equalsIgnoreCase(usuario.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "não é possível mudar o email da própria conta");
            }
        } else if (!email.equalsIgnoreCase(usuario.getEmail()) && usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "já existe um usuário com esse email");
        }

        usuario.setEmail(propriaConta ? usuario.getEmail() : email);
        usuario.setPerfil(requisicao.perfil());
        usuario.setAtivo(requisicao.ativo());
        if (requisicao.senha() != null) {
            usuario.setSenhaHash(passwordEncoder.encode(requisicao.senha()));
        }
        preencherDados(usuario, requisicao);
        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    private static void preencherDados(Usuario usuario, AtualizarUsuarioRequest requisicao) {
        usuario.setNome(requisicao.nome().trim());
        usuario.setMatricula(vazioParaNulo(requisicao.matricula()));
        usuario.setCargo(vazioParaNulo(requisicao.cargo()));
        usuario.setSetor(vazioParaNulo(requisicao.setor()));
        usuario.setTelefone(vazioParaNulo(requisicao.telefone()));
    }

    private static String normalizarEmail(String email) {
        // So tira espacos: o login compara o email exatamente como foi gravado.
        return email.trim();
    }

    private static String vazioParaNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
