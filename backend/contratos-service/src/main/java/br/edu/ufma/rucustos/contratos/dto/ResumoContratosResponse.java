package br.edu.ufma.rucustos.contratos.dto;

import java.math.BigDecimal;

public record ResumoContratosResponse(
        BigDecimal valorTotalContratos,
        BigDecimal valorTotalUtilizado,
        BigDecimal saldoContratos
) {
}
