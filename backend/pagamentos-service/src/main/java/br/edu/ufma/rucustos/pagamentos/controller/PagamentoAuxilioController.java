package br.edu.ufma.rucustos.pagamentos.controller;

import br.edu.ufma.rucustos.pagamentos.model.PagamentoAuxilio;
import br.edu.ufma.rucustos.pagamentos.repository.PagamentoAuxilioRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pagamentos/auxilios")
public class PagamentoAuxilioController {

    private static final Sort ORDEM = Sort.by(Sort.Order.desc("ano"), Sort.Order.desc("mes"), Sort.Order.asc("id"));

    private final PagamentoAuxilioRepository pagamentoAuxilioRepository;

    public PagamentoAuxilioController(PagamentoAuxilioRepository pagamentoAuxilioRepository) {
        this.pagamentoAuxilioRepository = pagamentoAuxilioRepository;
    }

    @GetMapping
    public List<PagamentoAuxilio> listar(
            @RequestParam(required = false) String setor,
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String auxilio) {

        Specification<PagamentoAuxilio> especificacao = Specification.where(null);
        if (setor != null) {
            especificacao = especificacao.and((root, query, cb) -> cb.equal(root.get("setor"), setor));
        }
        if (ano != null) {
            especificacao = especificacao.and((root, query, cb) -> cb.equal(root.get("ano"), ano));
        }
        if (mes != null) {
            especificacao = especificacao.and((root, query, cb) -> cb.equal(root.get("mes"), mes));
        }
        if (auxilio != null) {
            // Busca parcial: a planilha escreve o mesmo auxilio de formas diferentes
            // (ex: "CRECHE" em 2026 e "Auxílio Creche" em 2025).
            String termo = "%" + auxilio.toLowerCase() + "%";
            especificacao = especificacao.and((root, query, cb) -> cb.like(cb.lower(root.get("nomeAuxilio")), termo));
        }
        return pagamentoAuxilioRepository.findAll(especificacao, ORDEM);
    }

    @PostMapping
    public PagamentoAuxilio criar(@Valid @RequestBody PagamentoAuxilio pagamento) {
        pagamento.setId(null);
        if (pagamento.getValorTotal() == null) {
            pagamento.setValorTotal(somar(pagamento.getValorEmpenho1(), pagamento.getValorEmpenho2()));
        }
        return pagamentoAuxilioRepository.save(pagamento);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!pagamentoAuxilioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "pagamento não encontrado");
        }
        pagamentoAuxilioRepository.deleteById(id);
    }

    private static BigDecimal somar(BigDecimal valor1, BigDecimal valor2) {
        if (valor1 == null) {
            return valor2;
        }
        return valor2 == null ? valor1 : valor1.add(valor2);
    }
}
