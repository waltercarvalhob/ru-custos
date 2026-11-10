package br.edu.ufma.rucustos.pagamentos.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Uma linha do Controle Orcamentario. {@code id} e {@code valorEmpenho} ficam vazios enquanto o
 * valor do empenho nao for informado; {@code saldo} so existe quando ha valor.
 */
public record EmpenhoResumo(
        Long id,
        String setor,
        String numero,
        Integer ano,
        String numeroContrato,
        List<String> auxilios,
        BigDecimal valorEmpenho,
        BigDecimal valorPago,
        BigDecimal saldo
) {
}
