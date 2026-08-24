package br.edu.ufma.rucustos.pagamentos.controller;

import br.edu.ufma.rucustos.pagamentos.model.Pagamento;
import br.edu.ufma.rucustos.pagamentos.repository.PagamentoRepository;
import jakarta.validation.Valid;
import org.springframework.data.jpa.domain.Specification;
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
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    private final PagamentoRepository pagamentoRepository;

    public PagamentoController(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }

    @GetMapping
    public List<Pagamento> listar(
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String mesReferencia,
            @RequestParam(required = false) String numeroContrato) {

        Specification<Pagamento> especificacao = Specification.where(null);
        if (campus != null) {
            especificacao = especificacao.and((root, query, cb) -> cb.equal(root.get("campus"), campus));
        }
        if (mesReferencia != null) {
            especificacao = especificacao.and((root, query, cb) -> cb.equal(root.get("mesReferencia"), mesReferencia));
        }
        if (numeroContrato != null) {
            especificacao = especificacao.and((root, query, cb) -> cb.equal(root.get("numeroContrato"), numeroContrato));
        }
        return pagamentoRepository.findAll(especificacao);
    }

    @GetMapping("/{id}")
    public Pagamento buscarPorId(@PathVariable Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "pagamento não encontrado"));
    }

    @PostMapping
    public Pagamento criar(@Valid @RequestBody Pagamento pagamento) {
        pagamento.setId(null);
        return pagamentoRepository.save(pagamento);
    }

    @PutMapping("/{id}")
    public Pagamento atualizar(@PathVariable Long id, @Valid @RequestBody Pagamento dadosAtualizados) {
        Pagamento pagamento = pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "pagamento não encontrado"));

        pagamento.setCampus(dadosAtualizados.getCampus());
        pagamento.setMesReferencia(dadosAtualizados.getMesReferencia());
        pagamento.setEmpresa(dadosAtualizados.getEmpresa());
        pagamento.setNumeroContrato(dadosAtualizados.getNumeroContrato());
        pagamento.setNumeroProcessoContratacao(dadosAtualizados.getNumeroProcessoContratacao());
        pagamento.setModalidade(dadosAtualizados.getModalidade());
        pagamento.setNumeroProcessoPagamento(dadosAtualizados.getNumeroProcessoPagamento());
        pagamento.setRecurso(dadosAtualizados.getRecurso());
        pagamento.setNe(dadosAtualizados.getNe());
        pagamento.setValorNe(dadosAtualizados.getValorNe());
        pagamento.setNumeroNf(dadosAtualizados.getNumeroNf());
        pagamento.setValorNf(dadosAtualizados.getValorNf());
        pagamento.setGlosa(dadosAtualizados.getGlosa());
        pagamento.setValorPago(dadosAtualizados.getValorPago());
        pagamento.setObservacao(dadosAtualizados.getObservacao());
        pagamento.setAno(dadosAtualizados.getAno());
        return pagamentoRepository.save(pagamento);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!pagamentoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "pagamento não encontrado");
        }
        pagamentoRepository.deleteById(id);
    }
}
