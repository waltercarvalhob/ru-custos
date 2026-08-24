package br.edu.ufma.rucustos.siop.controller;

import br.edu.ufma.rucustos.siop.model.AcaoOrcamentaria;
import br.edu.ufma.rucustos.siop.repository.AcaoOrcamentariaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/siop/acoes-orcamentarias")
public class AcaoOrcamentariaController {

    private final AcaoOrcamentariaRepository acaoOrcamentariaRepository;

    public AcaoOrcamentariaController(AcaoOrcamentariaRepository acaoOrcamentariaRepository) {
        this.acaoOrcamentariaRepository = acaoOrcamentariaRepository;
    }

    @GetMapping
    public List<AcaoOrcamentaria> listar() {
        return acaoOrcamentariaRepository.findAll();
    }

    @GetMapping("/{id}")
    public AcaoOrcamentaria buscar(@PathVariable Long id) {
        return acaoOrcamentariaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ação orçamentária não encontrada"));
    }

    @PostMapping
    public AcaoOrcamentaria criar(@Valid @RequestBody AcaoOrcamentaria acao) {
        acao.setId(null);
        return acaoOrcamentariaRepository.save(acao);
    }

    @PutMapping("/{id}")
    public AcaoOrcamentaria atualizar(@PathVariable Long id, @Valid @RequestBody AcaoOrcamentaria dados) {
        AcaoOrcamentaria acao = acaoOrcamentariaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ação orçamentária não encontrada"));

        acao.setAcao(dados.getAcao());
        acao.setDiscriminacao(dados.getDiscriminacao());
        acao.setTipo(dados.getTipo());
        acao.setDotacaoPloaCusteio(dados.getDotacaoPloaCusteio());
        acao.setDotacaoAnuladaPloa(dados.getDotacaoAnuladaPloa());
        acao.setDotacaoInicialLoaCusteio(dados.getDotacaoInicialLoaCusteio());
        acao.setRecomposicaoPloa(dados.getRecomposicaoPloa());
        acao.setDotacaoAutorizada(dados.getDotacaoAutorizada());
        acao.setRemanejadoCancelado(dados.getRemanejadoCancelado());
        acao.setCreditoSuplementar(dados.getCreditoSuplementar());
        acao.setDotacaoAtualizada(dados.getDotacaoAtualizada());
        acao.setExecutado(dados.getExecutado());
        acao.setSaldoAtualizar(dados.getSaldoAtualizar());
        acao.setAtualizadoEm(dados.getAtualizadoEm());

        return acaoOrcamentariaRepository.save(acao);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!acaoOrcamentariaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "ação orçamentária não encontrada");
        }
        acaoOrcamentariaRepository.deleteById(id);
    }
}
