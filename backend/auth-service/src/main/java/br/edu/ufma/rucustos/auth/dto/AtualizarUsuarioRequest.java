package br.edu.ufma.rucustos.auth.dto;

import br.edu.ufma.rucustos.auth.model.PerfilUsuario;
import jakarta.validation.constraints.NotNull;

public record AtualizarUsuarioRequest(
        @NotNull PerfilUsuario perfil,
        @NotNull Boolean ativo
) {
}
