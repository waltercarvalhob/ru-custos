package br.edu.ufma.rucustos.saldo.dto;

import java.math.BigDecimal;

public record ContratosResumoDto(
        BigDecimal valorTotalContratos,
        BigDecimal valorTotalUtilizado,
        BigDecimal saldoContratos
) {
}
