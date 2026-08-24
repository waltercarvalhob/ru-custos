package br.edu.ufma.rucustos.previsoes.dto;

import java.math.BigDecimal;

public record PrevisoesResumoResponse(
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
