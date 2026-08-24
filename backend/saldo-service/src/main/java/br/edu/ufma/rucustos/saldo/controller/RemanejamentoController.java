package br.edu.ufma.rucustos.saldo.controller;

import br.edu.ufma.rucustos.saldo.model.RemanejamentoSugestao;
import br.edu.ufma.rucustos.saldo.repository.RemanejamentoSugestaoRepository;
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
@RequestMapping("/api/saldo/remanejamentos")
public class RemanejamentoController {

    private final RemanejamentoSugestaoRepository repository;

    public RemanejamentoController(RemanejamentoSugestaoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<RemanejamentoSugestao> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public RemanejamentoSugestao buscar(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "sugestão não encontrada"));
    }

    @PostMapping
    public RemanejamentoSugestao criar(@Valid @RequestBody RemanejamentoSugestao sugestao) {
        sugestao.setId(null);
        return repository.save(sugestao);
    }

    @PutMapping("/{id}")
    public RemanejamentoSugestao atualizar(@PathVariable Long id, @Valid @RequestBody RemanejamentoSugestao dados) {
        RemanejamentoSugestao existente = buscar(id);
        existente.setCategoria(dados.getCategoria());
        existente.setValorSugerido(dados.getValorSugerido());
        existente.setObservacao(dados.getObservacao());
        existente.setMesReferencia(dados.getMesReferencia());
        return repository.save(existente);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "sugestão não encontrada");
        }
        repository.deleteById(id);
    }
}
