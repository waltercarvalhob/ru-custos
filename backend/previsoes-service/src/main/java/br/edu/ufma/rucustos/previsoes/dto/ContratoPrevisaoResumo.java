package br.edu.ufma.rucustos.previsoes.dto;

import java.math.BigDecimal;

public record ContratoPrevisaoResumo(
        BigDecimal executadoAcumulado,
        BigDecimal mediaMensal,
        BigDecimal previsaoRestante,
        BigDecimal totalPrevistoAteFim,
        BigDecimal saldoEmpenhoPrevisto,
        BigDecimal reforcoEmpenhoNecessario,
        BigDecimal sobraEmpenho,
        BigDecimal sobraAproveitavel
) {
}
