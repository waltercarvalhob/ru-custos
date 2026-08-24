package br.edu.ufma.rucustos.previsoes.service;

import br.edu.ufma.rucustos.previsoes.dto.ContratoPrevisaoResumo;
import br.edu.ufma.rucustos.previsoes.model.ContratoPrevisao;
import br.edu.ufma.rucustos.previsoes.model.ExecucaoMensal;
import br.edu.ufma.rucustos.previsoes.model.TipoExecucao;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Calcula a previsao de execucao de um contrato de fornecimento, seguindo a metodologia da
 * planilha de origem: a previsao mensal e a media do que ja foi executado (meses sem lancamento
 * sao ignorados, meses com R$0 lancado entram na media normalmente); contratos sem nenhum mes
 * executado, ou cuja media resulte em R$0, usam (valor do contrato / 24) como estimativa inicial.
 * Contratos cuja vigencia termina antes do horizonte de previsao nao recebem projecao apos o fim
 * da vigencia.
 */
@Service
public class PrevisaoCalculoService {

    private static final int ESCALA = 2;
    private static final BigDecimal MESES_PADRAO = BigDecimal.valueOf(24);

    // horizonte coberto pela planilha de origem: dez/2025 a jan/2027
    private static final YearMonth HORIZONTE_INICIO = YearMonth.of(2025, 12);
    private static final YearMonth HORIZONTE_FIM = YearMonth.of(2027, 1);

    public ContratoPrevisaoResumo calcular(ContratoPrevisao contrato, List<ExecucaoMensal> execucoes) {
        List<ExecucaoMensal> executados = execucoes.stream()
                .filter(execucao -> execucao.getTipo() == TipoExecucao.EXECUTADO)
                .toList();
        List<ExecucaoMensal> previsoes = execucoes.stream()
                .filter(execucao -> execucao.getTipo() == TipoExecucao.PREVISAO)
                .toList();

        BigDecimal executadoAcumulado = executados.stream()
                .map(ExecucaoMensal::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal mediaMensal = calcularMediaMensal(contrato, executados, executadoAcumulado);

        BigDecimal previsaoRestante = calcularPrevisaoRestante(contrato, executados, previsoes, mediaMensal);

        BigDecimal totalPrevistoAteFim = executadoAcumulado.add(previsaoRestante);
        BigDecimal saldoEmpenhoPrevisto = contrato.getEmpenhado().subtract(totalPrevistoAteFim);

        BigDecimal reforcoEmpenhoNecessario = saldoEmpenhoPrevisto.compareTo(BigDecimal.ZERO) < 0
                ? saldoEmpenhoPrevisto.negate()
                : BigDecimal.ZERO;
        BigDecimal sobraEmpenho = saldoEmpenhoPrevisto.compareTo(BigDecimal.ZERO) > 0
                ? saldoEmpenhoPrevisto
                : BigDecimal.ZERO;
        // So conta como aproveitavel (anulavel para reforcar outros contratos) se o proprio
        // contrato estiver marcado como tal - nem toda sobra de empenho pode ser remanejada.
        BigDecimal sobraAproveitavel = contrato.isSobraAproveitavel() ? sobraEmpenho : BigDecimal.ZERO;

        return new ContratoPrevisaoResumo(
                executadoAcumulado,
                mediaMensal,
                previsaoRestante,
                totalPrevistoAteFim,
                saldoEmpenhoPrevisto,
                reforcoEmpenhoNecessario,
                sobraEmpenho,
                sobraAproveitavel
        );
    }

    private BigDecimal calcularMediaMensal(ContratoPrevisao contrato, List<ExecucaoMensal> executados,
                                            BigDecimal executadoAcumulado) {
        if (executados.isEmpty()) {
            return estimativaInicial(contrato);
        }

        BigDecimal media = executadoAcumulado.divide(BigDecimal.valueOf(executados.size()), ESCALA, RoundingMode.HALF_UP);
        if (media.compareTo(BigDecimal.ZERO) == 0) {
            return estimativaInicial(contrato);
        }
        return media;
    }

    private BigDecimal estimativaInicial(ContratoPrevisao contrato) {
        return contrato.getValorContrato().divide(MESES_PADRAO, ESCALA, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularPrevisaoRestante(ContratoPrevisao contrato, List<ExecucaoMensal> executados,
                                                 List<ExecucaoMensal> previsoes, BigDecimal mediaMensal) {
        YearMonth inicio;
        if (!executados.isEmpty()) {
            YearMonth ultimoExecutado = executados.stream()
                    .map(execucao -> YearMonth.from(execucao.getMesReferencia()))
                    .max(Comparator.naturalOrder())
                    .orElseThrow();
            inicio = ultimoExecutado.plusMonths(1);
        } else if (!previsoes.isEmpty()) {
            inicio = previsoes.stream()
                    .map(execucao -> YearMonth.from(execucao.getMesReferencia()))
                    .min(Comparator.naturalOrder())
                    .orElseThrow();
        } else {
            inicio = HORIZONTE_INICIO;
        }

        YearMonth fim = HORIZONTE_FIM;
        if (contrato.getVigenciaFim() != null) {
            YearMonth fimVigencia = YearMonth.from(contrato.getVigenciaFim());
            if (fimVigencia.isBefore(fim)) {
                fim = fimVigencia;
            }
        }

        Map<YearMonth, BigDecimal> previsoesPorMes = previsoes.stream()
                .collect(Collectors.toMap(
                        execucao -> YearMonth.from(execucao.getMesReferencia()),
                        ExecucaoMensal::getValor,
                        (existente, novo) -> novo));

        BigDecimal previsaoRestante = BigDecimal.ZERO;
        for (YearMonth mes = inicio; !mes.isAfter(fim); mes = mes.plusMonths(1)) {
            previsaoRestante = previsaoRestante.add(previsoesPorMes.getOrDefault(mes, mediaMensal));
        }
        return previsaoRestante;
    }
}
