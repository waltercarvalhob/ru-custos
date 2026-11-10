package br.edu.ufma.rucustos.pagamentos.controller;

import br.edu.ufma.rucustos.pagamentos.dto.EmpenhoResumo;
import br.edu.ufma.rucustos.pagamentos.model.Empenho;
import br.edu.ufma.rucustos.pagamentos.model.Pagamento;
import br.edu.ufma.rucustos.pagamentos.model.PagamentoAuxilio;
import br.edu.ufma.rucustos.pagamentos.repository.EmpenhoRepository;
import br.edu.ufma.rucustos.pagamentos.repository.PagamentoAuxilioRepository;
import br.edu.ufma.rucustos.pagamentos.repository.PagamentoRepository;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Controle Orcamentario: junta os empenhos citados nos lancamentos com os valores informados
 * a mao. Assim o valor pago se atualiza sozinho a cada lancamento novo no Controle Financeiro.
 */
@RestController
@RequestMapping("/api/pagamentos/empenhos")
public class EmpenhoController {

    private static final Pattern ANO_NO_NUMERO = Pattern.compile("(\\d{4})");

    private final EmpenhoRepository empenhoRepository;
    private final PagamentoRepository pagamentoRepository;
    private final PagamentoAuxilioRepository pagamentoAuxilioRepository;

    public EmpenhoController(EmpenhoRepository empenhoRepository, PagamentoRepository pagamentoRepository,
                             PagamentoAuxilioRepository pagamentoAuxilioRepository) {
        this.empenhoRepository = empenhoRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.pagamentoAuxilioRepository = pagamentoAuxilioRepository;
    }

    @GetMapping
    public List<EmpenhoResumo> listar(@RequestParam String setor) {
        Map<String, Linha> linhas = new LinkedHashMap<>();

        if ("RU".equals(setor)) {
            for (Pagamento p : pagamentoRepository.findAll()) {
                Linha linha = linha(linhas, p.getNe());
                if (linha == null) {
                    continue;
                }
                linha.pago = linha.pago.add(valor(p.getValorPago()));
                if (p.getNumeroContrato() != null && !p.getNumeroContrato().isBlank()) {
                    linha.contratos.add(p.getNumeroContrato().trim());
                }
                if (linha.anoPagamento == null) {
                    linha.anoPagamento = p.getAno();
                }
            }
        } else if ("AUXILIOS".equals(setor)) {
            for (PagamentoAuxilio a : pagamentoAuxilioRepository.findAll()) {
                somarAuxilio(linhas, a.getEmpenho1(), a.getValorEmpenho1(), a.getNomeAuxilio());
                somarAuxilio(linhas, a.getEmpenho2(), a.getValorEmpenho2(), a.getNomeAuxilio());
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "setor deve ser RU ou AUXILIOS");
        }

        // Empenhos informados que ainda nao aparecem em nenhum lancamento tambem entram.
        for (Empenho e : empenhoRepository.findBySetor(setor)) {
            Linha linha = linha(linhas, e.getNumero());
            if (linha != null) {
                linha.empenho = e;
            }
        }

        List<EmpenhoResumo> resultado = new ArrayList<>();
        for (Linha l : linhas.values()) {
            Empenho e = l.empenho;
            BigDecimal valorEmpenho = e == null ? null : e.getValor();
            String contrato = e != null && e.getNumeroContrato() != null && !e.getNumeroContrato().isBlank()
                    ? e.getNumeroContrato()
                    : (l.contratos.isEmpty() ? null : String.join(", ", l.contratos));
            resultado.add(new EmpenhoResumo(
                    e == null ? null : e.getId(),
                    setor,
                    e == null ? l.numero : e.getNumero(),
                    e != null && e.getAno() != null ? e.getAno() : anoDe(l),
                    contrato,
                    new ArrayList<>(l.auxilios),
                    valorEmpenho,
                    l.pago,
                    valorEmpenho == null ? null : valorEmpenho.subtract(l.pago)));
        }
        resultado.sort(Comparator
                .comparing(EmpenhoResumo::ano, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(EmpenhoResumo::numero));
        return resultado;
    }

    @PostMapping
    public Empenho criar(@Valid @RequestBody Empenho empenho) {
        empenho.setId(null);
        empenho.setNumero(empenho.getNumero().trim());
        boolean repetido = empenhoRepository.findBySetor(empenho.getSetor()).stream()
                .anyMatch(e -> chave(e.getNumero()).equals(chave(empenho.getNumero())));
        if (repetido) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "empenho já cadastrado");
        }
        return empenhoRepository.save(empenho);
    }

    @PutMapping("/{id}")
    public Empenho atualizar(@PathVariable Long id, @Valid @RequestBody Empenho dados) {
        Empenho empenho = empenhoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "empenho não encontrado"));
        empenho.setAno(dados.getAno());
        empenho.setNumeroContrato(dados.getNumeroContrato());
        empenho.setValor(dados.getValor());
        return empenhoRepository.save(empenho);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!empenhoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "empenho não encontrado");
        }
        empenhoRepository.deleteById(id);
    }

    private static void somarAuxilio(Map<String, Linha> linhas, String numero, BigDecimal valor, String auxilio) {
        Linha linha = linha(linhas, numero);
        if (linha == null) {
            return;
        }
        linha.pago = linha.pago.add(valor(valor));
        if (auxilio != null) {
            linha.auxilios.add(auxilio);
        }
    }

    private static Linha linha(Map<String, Linha> linhas, String numero) {
        if (numero == null || numero.isBlank() || numero.trim().equals("-")) {
            return null;
        }
        return linhas.computeIfAbsent(chave(numero), k -> new Linha(numero.trim()));
    }

    // "142/2025" e " 142/2025 " sao o mesmo empenho; a comparacao ignora espacos e maiusculas.
    private static String chave(String numero) {
        return numero.replaceAll("\\s+", "").toUpperCase();
    }

    private static BigDecimal valor(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }

    private static Integer anoDe(Linha l) {
        Matcher m = ANO_NO_NUMERO.matcher(l.numero);
        return m.find() ? Integer.valueOf(m.group(1)) : l.anoPagamento;
    }

    private static final class Linha {
        private final String numero;
        private BigDecimal pago = BigDecimal.ZERO;
        private final Set<String> contratos = new TreeSet<>();
        private final Set<String> auxilios = new TreeSet<>();
        private Integer anoPagamento;
        private Empenho empenho;

        private Linha(String numero) {
            this.numero = numero;
        }
    }
}
