package br.edu.ufma.rucustos.auth.dto;

public record LoginResponse(String token, UsuarioResponse usuario) {
}
