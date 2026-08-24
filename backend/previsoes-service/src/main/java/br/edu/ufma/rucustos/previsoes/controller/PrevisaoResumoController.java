package br.edu.ufma.rucustos.previsoes.controller;

import br.edu.ufma.rucustos.previsoes.dto.ContratoPrevisaoResumo;
import br.edu.ufma.rucustos.previsoes.dto.PrevisoesResumoResponse;
import br.edu.ufma.rucustos.previsoes.model.ContratoPrevisao;
import br.edu.ufma.rucustos.previsoes.model.ExecucaoMensal;
import br.edu.ufma.rucustos.previsoes.repository.ContratoPrevisaoRepository;
import br.edu.ufma.rucustos.previsoes.repository.ExecucaoMensalRepository;
import br.edu.ufma.rucustos.previsoes.service.PrevisaoCalculoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/previsoes")
public class PrevisaoResumoController {

    private final ContratoPrevisaoRepository contratoPrevisaoRepository;
    private final ExecucaoMensalRepository execucaoMensalRepository;
    private final PrevisaoCalculoService previsaoCalculoService;

    public PrevisaoResumoController(ContratoPrevisaoRepository contratoPrevisaoRepository,
                                     ExecucaoMensalRepository execucaoMensalRepository,
                                     PrevisaoCalculoService previsaoCalculoService) {
        this.contratoPrevisaoRepository = contratoPrevisaoRepository;
        this.execucaoMensalRepository = execucaoMensalRepository;
        this.previsaoCalculoService = previsaoCalculoService;
    }

    @GetMapping("/contratos/{id}/resumo")
    public ContratoPrevisaoResumo resumoContrato(@PathVariable Long id) {
        ContratoPrevisao contrato = contratoPrevisaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato de previsão não encontrado"));
        List<ExecucaoMensal> execucoes = execucaoMensalRepository.findByContratoPrevisaoIdOrderByMesReferencia(id);
        return previsaoCalculoService.calcular(contrato, execucoes);
    }

    @GetMapping("/resumo")
    public PrevisoesResumoResponse resumoGeral() {
        List<ContratoPrevisao> contratos = contratoPrevisaoRepository.findAll();

        BigDecimal totalEmpenhado = BigDecimal.ZERO;
        BigDecimal executadoAcumulado = BigDecimal.ZERO;
        BigDecimal previsaoRestante = BigDecimal.ZERO;
        BigDecimal totalPrevistoAteFim = BigDecimal.ZERO;
        BigDecimal saldoEmpenhoPrevisto = BigDecimal.ZERO;
        BigDecimal reforcoEmpenhoNecessario = BigDecimal.ZERO;
        BigDecimal sobraEmpenho = BigDecimal.ZERO;
        BigDecimal sobraAproveitavel = BigDecimal.ZERO;

        for (ContratoPrevisao contrato : contratos) {
            List<ExecucaoMensal> execucoes =
                    execucaoMensalRepository.findByContratoPrevisaoIdOrderByMesReferencia(contrato.getId());
            ContratoPrevisaoResumo resumo = previsaoCalculoService.calcular(contrato, execucoes);

            totalEmpenhado = totalEmpenhado.add(contrato.getEmpenhado());
            executadoAcumulado = executadoAcumulado.add(resumo.executadoAcumulado());
            previsaoRestante = previsaoRestante.add(resumo.previsaoRestante());
            totalPrevistoAteFim = totalPrevistoAteFim.add(resumo.totalPrevistoAteFim());
            saldoEmpenhoPrevisto = saldoEmpenhoPrevisto.add(resumo.saldoEmpenhoPrevisto());
            reforcoEmpenhoNecessario = reforcoEmpenhoNecessario.add(resumo.reforcoEmpenhoNecessario());
            sobraEmpenho = sobraEmpenho.add(resumo.sobraEmpenho());
            sobraAproveitavel = sobraAproveitavel.add(resumo.sobraAproveitavel());
        }

        return new PrevisoesResumoResponse(
                totalEmpenhado,
                executadoAcumulado,
                previsaoRestante,
                totalPrevistoAteFim,
                saldoEmpenhoPrevisto,
                reforcoEmpenhoNecessario,
                sobraEmpenho,
                sobraAproveitavel
        );
    }
}
