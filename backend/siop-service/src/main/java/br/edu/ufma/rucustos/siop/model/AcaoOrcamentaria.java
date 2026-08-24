package br.edu.ufma.rucustos.siop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "acoes_orcamentarias")
public class AcaoOrcamentaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String acao;

    @NotBlank
    private String discriminacao;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TipoAcaoOrcamentaria tipo;

    @NotNull
    @Column(name = "dotacao_ploa_custeio")
    private BigDecimal dotacaoPloaCusteio;

    @NotNull
    @Column(name = "dotacao_anulada_ploa")
    private BigDecimal dotacaoAnuladaPloa;

    @NotNull
    @Column(name = "dotacao_inicial_loa_custeio")
    private BigDecimal dotacaoInicialLoaCusteio;

    @NotNull
    @Column(name = "recomposicao_ploa")
    private BigDecimal recomposicaoPloa;

    @NotNull
    @Column(name = "dotacao_autorizada")
    private BigDecimal dotacaoAutorizada;

    @NotNull
    @Column(name = "remanejado_cancelado")
    private BigDecimal remanejadoCancelado;

    @NotNull
    @Column(name = "credito_suplementar")
    private BigDecimal creditoSuplementar;

    @NotNull
    @Column(name = "dotacao_atualizada")
    private BigDecimal dotacaoAtualizada;

    @NotNull
    private BigDecimal executado;

    @NotNull
    @Column(name = "saldo_atualizar")
    private BigDecimal saldoAtualizar;

    @Column(name = "atualizado_em")
    private LocalDate atualizadoEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAcao() {
        return acao;
    }

    public void setAcao(String acao) {
        this.acao = acao;
    }

    public String getDiscriminacao() {
        return discriminacao;
    }

    public void setDiscriminacao(String discriminacao) {
        this.discriminacao = discriminacao;
    }

    public TipoAcaoOrcamentaria getTipo() {
        return tipo;
    }

    public void setTipo(TipoAcaoOrcamentaria tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getDotacaoPloaCusteio() {
        return dotacaoPloaCusteio;
    }

    public void setDotacaoPloaCusteio(BigDecimal dotacaoPloaCusteio) {
        this.dotacaoPloaCusteio = dotacaoPloaCusteio;
    }

    public BigDecimal getDotacaoAnuladaPloa() {
        return dotacaoAnuladaPloa;
    }

    public void setDotacaoAnuladaPloa(BigDecimal dotacaoAnuladaPloa) {
        this.dotacaoAnuladaPloa = dotacaoAnuladaPloa;
    }

    public BigDecimal getDotacaoInicialLoaCusteio() {
        return dotacaoInicialLoaCusteio;
    }

    public void setDotacaoInicialLoaCusteio(BigDecimal dotacaoInicialLoaCusteio) {
        this.dotacaoInicialLoaCusteio = dotacaoInicialLoaCusteio;
    }

    public BigDecimal getRecomposicaoPloa() {
        return recomposicaoPloa;
    }

    public void setRecomposicaoPloa(BigDecimal recomposicaoPloa) {
        this.recomposicaoPloa = recomposicaoPloa;
    }

    public BigDecimal getDotacaoAutorizada() {
        return dotacaoAutorizada;
    }

    public void setDotacaoAutorizada(BigDecimal dotacaoAutorizada) {
        this.dotacaoAutorizada = dotacaoAutorizada;
    }

    public BigDecimal getRemanejadoCancelado() {
        return remanejadoCancelado;
    }

    public void setRemanejadoCancelado(BigDecimal remanejadoCancelado) {
        this.remanejadoCancelado = remanejadoCancelado;
    }

    public BigDecimal getCreditoSuplementar() {
        return creditoSuplementar;
    }

    public void setCreditoSuplementar(BigDecimal creditoSuplementar) {
        this.creditoSuplementar = creditoSuplementar;
    }

    public BigDecimal getDotacaoAtualizada() {
        return dotacaoAtualizada;
    }

    public void setDotacaoAtualizada(BigDecimal dotacaoAtualizada) {
        this.dotacaoAtualizada = dotacaoAtualizada;
    }

    public BigDecimal getExecutado() {
        return executado;
    }

    public void setExecutado(BigDecimal executado) {
        this.executado = executado;
    }

    public BigDecimal getSaldoAtualizar() {
        return saldoAtualizar;
    }

    public void setSaldoAtualizar(BigDecimal saldoAtualizar) {
        this.saldoAtualizar = saldoAtualizar;
    }

    public LocalDate getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDate atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
