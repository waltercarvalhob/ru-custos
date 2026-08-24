package br.edu.ufma.rucustos.previsoes.controller;

import br.edu.ufma.rucustos.previsoes.model.ContratoPrevisao;
import br.edu.ufma.rucustos.previsoes.model.ExecucaoMensal;
import br.edu.ufma.rucustos.previsoes.repository.ContratoPrevisaoRepository;
import br.edu.ufma.rucustos.previsoes.repository.ExecucaoMensalRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/previsoes/execucoes")
public class ExecucaoMensalController {

    private final ExecucaoMensalRepository execucaoMensalRepository;
    private final ContratoPrevisaoRepository contratoPrevisaoRepository;

    public ExecucaoMensalController(ExecucaoMensalRepository execucaoMensalRepository,
                                     ContratoPrevisaoRepository contratoPrevisaoRepository) {
        this.execucaoMensalRepository = execucaoMensalRepository;
        this.contratoPrevisaoRepository = contratoPrevisaoRepository;
    }

    @GetMapping
    public List<ExecucaoMensal> listar(@RequestParam(required = false) Long contratoPrevisaoId) {
        if (contratoPrevisaoId != null) {
            return execucaoMensalRepository.findByContratoPrevisaoIdOrderByMesReferencia(contratoPrevisaoId);
        }
        return execucaoMensalRepository.findAll();
    }

    @GetMapping("/{id}")
    public ExecucaoMensal buscar(@PathVariable Long id) {
        return execucaoMensalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "execução mensal não encontrada"));
    }

    @PostMapping
    public ExecucaoMensal criar(@Valid @RequestBody ExecucaoMensal execucao) {
        execucao.setId(null);
        execucao.setContratoPrevisao(resolverContrato(execucao.getContratoPrevisao()));
        return execucaoMensalRepository.save(execucao);
    }

    @PutMapping("/{id}")
    public ExecucaoMensal atualizar(@PathVariable Long id, @Valid @RequestBody ExecucaoMensal dados) {
        ExecucaoMensal execucao = execucaoMensalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "execução mensal não encontrada"));

        execucao.setContratoPrevisao(resolverContrato(dados.getContratoPrevisao()));
        execucao.setMesReferencia(dados.getMesReferencia());
        execucao.setTipo(dados.getTipo());
        execucao.setValor(dados.getValor());

        return execucaoMensalRepository.save(execucao);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!execucaoMensalRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "execução mensal não encontrada");
        }
        execucaoMensalRepository.deleteById(id);
    }

    private ContratoPrevisao resolverContrato(ContratoPrevisao referencia) {
        if (referencia == null || referencia.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "contratoPrevisao.id é obrigatório");
        }
        return contratoPrevisaoRepository.findById(referencia.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato de previsão não encontrado"));
    }
}
