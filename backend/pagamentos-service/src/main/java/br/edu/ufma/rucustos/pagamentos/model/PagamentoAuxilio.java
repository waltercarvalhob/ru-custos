package br.edu.ufma.rucustos.pagamentos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pagamentos_auxilios")
public class PagamentoAuxilio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String setor;

    @NotNull
    private Integer ano;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer mes;

    @Column(name = "data_abertura")
    private LocalDate dataAbertura;

    @Column(name = "numero_processo")
    private String numeroProcesso;

    @NotBlank
    @Column(name = "nome_auxilio")
    private String nomeAuxilio;

    private Integer discentes;

    @Column(name = "valor_unitario", precision = 15, scale = 2)
    private BigDecimal valorUnitario;

    // A folha pode ser paga por dois empenhos, normalmente de exercicios diferentes.
    private String empenho1;

    @Column(name = "valor_empenho1", precision = 15, scale = 2)
    private BigDecimal valorEmpenho1;

    private String empenho2;

    @Column(name = "valor_empenho2", precision = 15, scale = 2)
    private BigDecimal valorEmpenho2;

    @Column(name = "valor_total", precision = 15, scale = 2)
    private BigDecimal valorTotal;

    private String observacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSetor() {
        return setor;
    }

    public void setSetor(String setor) {
        this.setor = setor;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public Integer getMes() {
        return mes;
    }

    public void setMes(Integer mes) {
        this.mes = mes;
    }

    public LocalDate getDataAbertura() {
        return dataAbertura;
    }

    public void setDataAbertura(LocalDate dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public String getNumeroProcesso() {
        return numeroProcesso;
    }

    public void setNumeroProcesso(String numeroProcesso) {
        this.numeroProcesso = numeroProcesso;
    }

    public String getNomeAuxilio() {
        return nomeAuxilio;
    }

    public void setNomeAuxilio(String nomeAuxilio) {
        this.nomeAuxilio = nomeAuxilio;
    }

    public Integer getDiscentes() {
        return discentes;
    }

    public void setDiscentes(Integer discentes) {
        this.discentes = discentes;
    }

    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }

    public void setValorUnitario(BigDecimal valorUnitario) {
        this.valorUnitario = valorUnitario;
    }

    public String getEmpenho1() {
        return empenho1;
    }

    public void setEmpenho1(String empenho1) {
        this.empenho1 = empenho1;
    }

    public BigDecimal getValorEmpenho1() {
        return valorEmpenho1;
    }

    public void setValorEmpenho1(BigDecimal valorEmpenho1) {
        this.valorEmpenho1 = valorEmpenho1;
    }

    public String getEmpenho2() {
        return empenho2;
    }

    public void setEmpenho2(String empenho2) {
        this.empenho2 = empenho2;
    }

    public BigDecimal getValorEmpenho2() {
        return valorEmpenho2;
    }

    public void setValorEmpenho2(BigDecimal valorEmpenho2) {
        this.valorEmpenho2 = valorEmpenho2;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
