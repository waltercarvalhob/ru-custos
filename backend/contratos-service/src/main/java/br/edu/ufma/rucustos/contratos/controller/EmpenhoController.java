package br.edu.ufma.rucustos.contratos.controller;

import br.edu.ufma.rucustos.contratos.model.Contrato;
import br.edu.ufma.rucustos.contratos.model.Empenho;
import br.edu.ufma.rucustos.contratos.repository.ContratoRepository;
import br.edu.ufma.rucustos.contratos.repository.EmpenhoRepository;
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
@RequestMapping("/api/contratos/empenhos")
public class EmpenhoController {

    private final EmpenhoRepository empenhoRepository;
    private final ContratoRepository contratoRepository;

    public EmpenhoController(EmpenhoRepository empenhoRepository, ContratoRepository contratoRepository) {
        this.empenhoRepository = empenhoRepository;
        this.contratoRepository = contratoRepository;
    }

    @GetMapping
    public List<Empenho> listar(@RequestParam(required = false) Long contratoId) {
        if (contratoId != null) {
            return empenhoRepository.findByContratoId(contratoId);
        }
        return empenhoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Empenho buscarPorId(@PathVariable Long id) {
        return empenhoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "empenho não encontrado"));
    }

    @PostMapping
    public Empenho criar(@Valid @RequestBody Empenho empenho) {
        Contrato contrato = buscarContratoDoEmpenho(empenho);
        empenho.setId(null);
        empenho.setContrato(contrato);
        return empenhoRepository.save(empenho);
    }

    @PutMapping("/{id}")
    public Empenho atualizar(@PathVariable Long id, @Valid @RequestBody Empenho dadosAtualizados) {
        Empenho empenho = empenhoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "empenho não encontrado"));
        Contrato contrato = buscarContratoDoEmpenho(dadosAtualizados);

        empenho.setContrato(contrato);
        empenho.setNumeroNe(dadosAtualizados.getNumeroNe());
        empenho.setSaldoEmpenho(dadosAtualizados.getSaldoEmpenho());
        empenho.setSaldoNe2025Informativo(dadosAtualizados.getSaldoNe2025Informativo());
        empenho.setAno(dadosAtualizados.getAno());
        return empenhoRepository.save(empenho);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!empenhoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "empenho não encontrado");
        }
        empenhoRepository.deleteById(id);
    }

    private Contrato buscarContratoDoEmpenho(Empenho empenho) {
        if (empenho.getContrato() == null || empenho.getContrato().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "contrato é obrigatório");
        }
        return contratoRepository.findById(empenho.getContrato().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato não encontrado"));
    }
}
