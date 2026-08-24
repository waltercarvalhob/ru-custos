package br.edu.ufma.rucustos.contratos.controller;

import br.edu.ufma.rucustos.contratos.dto.ResumoContratosResponse;
import br.edu.ufma.rucustos.contratos.model.Campus;
import br.edu.ufma.rucustos.contratos.model.Contrato;
import br.edu.ufma.rucustos.contratos.repository.CampusRepository;
import br.edu.ufma.rucustos.contratos.repository.ContratoRepository;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/contratos")
public class ContratoController {

    private final ContratoRepository contratoRepository;
    private final CampusRepository campusRepository;

    public ContratoController(ContratoRepository contratoRepository, CampusRepository campusRepository) {
        this.contratoRepository = contratoRepository;
        this.campusRepository = campusRepository;
    }

    @GetMapping
    public List<Contrato> listar(@RequestParam(required = false) Long campusId) {
        if (campusId != null) {
            return contratoRepository.findByCampusId(campusId);
        }
        return contratoRepository.findAll();
    }

    @GetMapping("/resumo")
    public ResumoContratosResponse resumo() {
        BigDecimal valorTotalContratos = contratoRepository.sumValorContratual();
        BigDecimal valorTotalUtilizado = contratoRepository.sumValorUtilizado();
        BigDecimal saldoContratos = contratoRepository.sumSaldo();
        return new ResumoContratosResponse(valorTotalContratos, valorTotalUtilizado, saldoContratos);
    }

    @GetMapping("/{id}")
    public Contrato buscarPorId(@PathVariable Long id) {
        return contratoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato não encontrado"));
    }

    @PostMapping
    public Contrato criar(@Valid @RequestBody Contrato contrato) {
        Campus campus = buscarCampusDoContrato(contrato);
        contrato.setId(null);
        contrato.setCampus(campus);
        return contratoRepository.save(contrato);
    }

    @PutMapping("/{id}")
    public Contrato atualizar(@PathVariable Long id, @Valid @RequestBody Contrato dadosAtualizados) {
        Contrato contrato = contratoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato não encontrado"));
        Campus campus = buscarCampusDoContrato(dadosAtualizados);

        contrato.setCampus(campus);
        contrato.setEmpresa(dadosAtualizados.getEmpresa());
        contrato.setNumeroContrato(dadosAtualizados.getNumeroContrato());
        contrato.setProcessoContratacao(dadosAtualizados.getProcessoContratacao());
        contrato.setValorContratual(dadosAtualizados.getValorContratual());
        contrato.setValorUtilizado(dadosAtualizados.getValorUtilizado());
        contrato.setSaldo(dadosAtualizados.getSaldo());
        contrato.setVigenciaFim(dadosAtualizados.getVigenciaFim());
        contrato.setStatus(dadosAtualizados.getStatus());
        return contratoRepository.save(contrato);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!contratoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "contrato não encontrado");
        }
        contratoRepository.deleteById(id);
    }

    private Campus buscarCampusDoContrato(Contrato contrato) {
        if (contrato.getCampus() == null || contrato.getCampus().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "campus é obrigatório");
        }
        return campusRepository.findById(contrato.getCampus().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "campus não encontrado"));
    }
}
