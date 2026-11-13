package br.edu.ufma.rucustos.auth.dto;

import br.edu.ufma.rucustos.auth.model.PerfilUsuario;
import br.edu.ufma.rucustos.auth.model.Usuario;

import java.time.LocalDateTime;

public record UsuarioResponse(Long id, String nome, String email, PerfilUsuario perfil, boolean ativo,
                              String matricula, String cargo, String setor, String telefone,
                              LocalDateTime criadoEm) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil(),
                usuario.isAtivo(), usuario.getMatricula(), usuario.getCargo(), usuario.getSetor(),
                usuario.getTelefone(), usuario.getCriadoEm());
    }
}
