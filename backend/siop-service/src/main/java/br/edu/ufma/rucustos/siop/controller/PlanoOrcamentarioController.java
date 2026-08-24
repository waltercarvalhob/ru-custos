package br.edu.ufma.rucustos.siop.controller;

import br.edu.ufma.rucustos.siop.model.PlanoOrcamentario;
import br.edu.ufma.rucustos.siop.repository.PlanoOrcamentarioRepository;
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
@RequestMapping("/api/siop/planos-orcamentarios")
public class PlanoOrcamentarioController {

    private final PlanoOrcamentarioRepository planoOrcamentarioRepository;

    public PlanoOrcamentarioController(PlanoOrcamentarioRepository planoOrcamentarioRepository) {
        this.planoOrcamentarioRepository = planoOrcamentarioRepository;
    }

    @GetMapping
    public List<PlanoOrcamentario> listar() {
        return planoOrcamentarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public PlanoOrcamentario buscar(@PathVariable Long id) {
        return planoOrcamentarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "plano orçamentário não encontrado"));
    }

    @PostMapping
    public PlanoOrcamentario criar(@Valid @RequestBody PlanoOrcamentario plano) {
        plano.setId(null);
        return planoOrcamentarioRepository.save(plano);
    }

    @PutMapping("/{id}")
    public PlanoOrcamentario atualizar(@PathVariable Long id, @Valid @RequestBody PlanoOrcamentario dados) {
        PlanoOrcamentario plano = planoOrcamentarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "plano orçamentário não encontrado"));

        plano.setLocalizador(dados.getLocalizador());
        plano.setPlanoOrcamentario(dados.getPlanoOrcamentario());
        plano.setProjetoLei(dados.getProjetoLei());
        plano.setDotacaoInicial(dados.getDotacaoInicial());
        plano.setDotacaoAtual(dados.getDotacaoAtual());
        plano.setEmpenhado(dados.getEmpenhado());
        plano.setLiquidado(dados.getLiquidado());
        plano.setPago(dados.getPago());

        return planoOrcamentarioRepository.save(plano);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!planoOrcamentarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "plano orçamentário não encontrado");
        }
        planoOrcamentarioRepository.deleteById(id);
    }
}
