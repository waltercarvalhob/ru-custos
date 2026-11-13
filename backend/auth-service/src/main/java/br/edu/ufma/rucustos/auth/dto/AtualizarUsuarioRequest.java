package br.edu.ufma.rucustos.auth.dto;

import br.edu.ufma.rucustos.auth.model.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cadastro/edicao de usuario feito pelo ADMIN. Na criacao a senha e obrigatoria; na edicao, senha
 * vazia mantem a atual.
 */
public record AtualizarUsuarioRequest(
        @NotBlank(message = "informe o nome") @Size(max = 150) String nome,
        @NotBlank(message = "informe o email") @Email(message = "email inválido") @Size(max = 150) String email,
        @Size(min = 6, max = 72, message = "a senha deve ter de 6 a 72 caracteres") String senha,
        @NotNull PerfilUsuario perfil,
        @NotNull Boolean ativo,
        @Size(max = 30) String matricula,
        @Size(max = 120) String cargo,
        @Size(max = 120) String setor,
        @Size(max = 30) String telefone
) {
}
