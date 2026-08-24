package br.edu.ufma.rucustos.auth.dto;

import br.edu.ufma.rucustos.auth.model.PerfilUsuario;
import br.edu.ufma.rucustos.auth.model.Usuario;

public record UsuarioResponse(Long id, String nome, String email, PerfilUsuario perfil) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
    }
}
