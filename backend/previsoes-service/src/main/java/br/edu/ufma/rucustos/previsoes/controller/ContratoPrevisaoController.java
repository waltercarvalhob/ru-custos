package br.edu.ufma.rucustos.previsoes.controller;

import br.edu.ufma.rucustos.previsoes.model.ContratoPrevisao;
import br.edu.ufma.rucustos.previsoes.repository.ContratoPrevisaoRepository;
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
@RequestMapping("/api/previsoes/contratos")
public class ContratoPrevisaoController {

    private final ContratoPrevisaoRepository contratoPrevisaoRepository;

    public ContratoPrevisaoController(ContratoPrevisaoRepository contratoPrevisaoRepository) {
        this.contratoPrevisaoRepository = contratoPrevisaoRepository;
    }

    @GetMapping
    public List<ContratoPrevisao> listar() {
        return contratoPrevisaoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ContratoPrevisao buscar(@PathVariable Long id) {
        return contratoPrevisaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato de previsão não encontrado"));
    }

    @PostMapping
    public ContratoPrevisao criar(@Valid @RequestBody ContratoPrevisao contrato) {
        contrato.setId(null);
        return contratoPrevisaoRepository.save(contrato);
    }

    @PutMapping("/{id}")
    public ContratoPrevisao atualizar(@PathVariable Long id, @Valid @RequestBody ContratoPrevisao dados) {
        ContratoPrevisao contrato = contratoPrevisaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato de previsão não encontrado"));

        contrato.setFavorecido(dados.getFavorecido());
        contrato.setNumeroContrato(dados.getNumeroContrato());
        contrato.setVigenciaInicio(dados.getVigenciaInicio());
        contrato.setVigenciaFim(dados.getVigenciaFim());
        contrato.setPlanoInterno(dados.getPlanoInterno());
        contrato.setSetorSipac(dados.getSetorSipac());
        contrato.setObjeto(dados.getObjeto());
        contrato.setValorContrato(dados.getValorContrato());
        contrato.setNumeroNe(dados.getNumeroNe());
        contrato.setEmpenhado(dados.getEmpenhado());
        contrato.setProcessoSei(dados.getProcessoSei());

        return contratoPrevisaoRepository.save(contrato);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!contratoPrevisaoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato de previsão não encontrado");
        }
        contratoPrevisaoRepository.deleteById(id);
    }
}
