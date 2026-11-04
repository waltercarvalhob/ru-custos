package br.edu.ufma.rucustos.auth.controller;

import br.edu.ufma.rucustos.auth.dto.AtualizarUsuarioRequest;
import br.edu.ufma.rucustos.auth.dto.UsuarioResponse;
import br.edu.ufma.rucustos.auth.model.Usuario;
import br.edu.ufma.rucustos.auth.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll(ORDEM).stream().map(UsuarioResponse::de).toList();
    }

    @PutMapping("/{id}")
    public UsuarioResponse atualizar(@PathVariable Long id, @Valid @RequestBody AtualizarUsuarioRequest requisicao,
                                     Principal principal) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "usuário não encontrado"));

        // Evita que o sistema fique sem nenhum administrador por engano.
        if (usuario.getEmail().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "não é possível alterar a própria conta");
        }

        usuario.setPerfil(requisicao.perfil());
        usuario.setAtivo(requisicao.ativo());
        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }
}
