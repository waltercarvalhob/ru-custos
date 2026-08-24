package br.edu.ufma.rucustos.siop.dto;

import java.math.BigDecimal;

public record SiopResumoResponse(
        BigDecimal dotacaoAtualCusteio,
        BigDecimal empenhadoCusteio,
        BigDecimal saldoAUtilizarCusteio
) {
}
