package br.edu.ufma.rucustos.siop.controller;

import br.edu.ufma.rucustos.siop.dto.SiopResumoResponse;
import br.edu.ufma.rucustos.siop.model.AcaoOrcamentaria;
import br.edu.ufma.rucustos.siop.model.TipoAcaoOrcamentaria;
import br.edu.ufma.rucustos.siop.repository.AcaoOrcamentariaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/siop")
public class SiopResumoController {

    private final AcaoOrcamentariaRepository acaoOrcamentariaRepository;

    public SiopResumoController(AcaoOrcamentariaRepository acaoOrcamentariaRepository) {
        this.acaoOrcamentariaRepository = acaoOrcamentariaRepository;
    }

    @GetMapping("/resumo")
    public SiopResumoResponse resumo() {
        // Considera apenas a linha "Matriz PNAES - Custeio": e a dotacao especifica de custeio dos RUs.
        // As demais linhas tipo=CUSTEIO (Bolsas, PROMISAES, INCLUIR) sao outros subprogramas do PNAES,
        // sem relacao com o custeio dos restaurantes universitarios, e por isso ficam fora deste resumo.
        List<AcaoOrcamentaria> acoesCusteio = acaoOrcamentariaRepository.findAll().stream()
                .filter(acao -> acao.getTipo() == TipoAcaoOrcamentaria.CUSTEIO)
                .filter(acao -> acao.getDiscriminacao() != null
                        && acao.getDiscriminacao().trim().equalsIgnoreCase("Matriz PNAES - Custeio"))
                .toList();

        BigDecimal dotacaoAtualCusteio = acoesCusteio.stream()
                .map(AcaoOrcamentaria::getDotacaoAtualizada)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal empenhadoCusteio = acoesCusteio.stream()
                .map(AcaoOrcamentaria::getExecutado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal saldoAUtilizarCusteio = acoesCusteio.stream()
                .map(AcaoOrcamentaria::getSaldoAtualizar)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new SiopResumoResponse(dotacaoAtualCusteio, empenhadoCusteio, saldoAUtilizarCusteio);
    }
}
