package br.edu.ufma.rucustos.saldo.dto;

import java.math.BigDecimal;

/**
 * Espelha a aba "Saldo Real RUs" da planilha original: agrega os resumos de contratos-service,
 * previsoes-service e siop-service e calcula os campos derivados do resumo executivo.
 */
public record SaldoResumoResponse(
        BigDecimal valorTotalContratos,
        BigDecimal valorTotalUtilizado,
        BigDecimal executadoAcumulado,
        BigDecimal previsaoRestante,
        BigDecimal totalPrevistoAteFim,
        BigDecimal saldoContrato,
        BigDecimal totalEmpenhado,
        BigDecimal saldoEmpenho,
        BigDecimal reforcoEmpenhoNecessario,
        BigDecimal sobraEmpenho,
        BigDecimal reforcoLiquido,
        BigDecimal dotacaoAtualCusteio,
        BigDecimal empenhadoCusteio,
        BigDecimal saldoAUtilizarCusteio,
        BigDecimal valorDisponivelRemanejamento
) {

    public static SaldoResumoResponse montar(ContratosResumoDto contratos, PrevisoesResumoDto previsoes, SiopResumoDto siop) {
        BigDecimal saldoContrato = contratos.valorTotalContratos().subtract(previsoes.totalPrevistoAteFim());
        BigDecimal saldoEmpenho = previsoes.totalEmpenhado().subtract(previsoes.totalPrevistoAteFim());
        BigDecimal reforcoLiquido = previsoes.reforcoEmpenhoNecessario().subtract(previsoes.sobraAproveitavel());
        if (reforcoLiquido.signum() < 0) {
            reforcoLiquido = BigDecimal.ZERO;
        }
        BigDecimal valorDisponivelRemanejamento = siop.saldoAUtilizarCusteio().subtract(reforcoLiquido);

        return new SaldoResumoResponse(
                contratos.valorTotalContratos(),
                contratos.valorTotalUtilizado(),
                previsoes.executadoAcumulado(),
                previsoes.previsaoRestante(),
                previsoes.totalPrevistoAteFim(),
                saldoContrato,
                previsoes.totalEmpenhado(),
                saldoEmpenho,
                previsoes.reforcoEmpenhoNecessario(),
                previsoes.sobraEmpenho(),
                reforcoLiquido,
                siop.dotacaoAtualCusteio(),
                siop.empenhadoCusteio(),
                siop.saldoAUtilizarCusteio(),
                valorDisponivelRemanejamento
        );
    }
}
