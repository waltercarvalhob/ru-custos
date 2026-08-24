package br.edu.ufma.rucustos.saldo.dto;

import java.math.BigDecimal;

public record PrevisoesResumoDto(
        BigDecimal totalEmpenhado,
        BigDecimal executadoAcumulado,
        BigDecimal previsaoRestante,
        BigDecimal totalPrevistoAteFim,
        BigDecimal saldoEmpenhoPrevisto,
        BigDecimal reforcoEmpenhoNecessario,
        BigDecimal sobraEmpenho,
        BigDecimal sobraAproveitavel
) {
}
