package br.edu.ufma.rucustos.siop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "planos_orcamentarios")
public class PlanoOrcamentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String localizador;

    @NotBlank
    @Column(name = "plano_orcamentario")
    private String planoOrcamentario;

    @NotNull
    @Column(name = "projeto_lei")
    private BigDecimal projetoLei;

    @NotNull
    @Column(name = "dotacao_inicial")
    private BigDecimal dotacaoInicial;

    @NotNull
    @Column(name = "dotacao_atual")
    private BigDecimal dotacaoAtual;

    @NotNull
    private BigDecimal empenhado;

    @NotNull
    private BigDecimal liquidado;

    @NotNull
    private BigDecimal pago;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocalizador() {
        return localizador;
    }

    public void setLocalizador(String localizador) {
        this.localizador = localizador;
    }

    public String getPlanoOrcamentario() {
        return planoOrcamentario;
    }

    public void setPlanoOrcamentario(String planoOrcamentario) {
        this.planoOrcamentario = planoOrcamentario;
    }

    public BigDecimal getProjetoLei() {
        return projetoLei;
    }

    public void setProjetoLei(BigDecimal projetoLei) {
        this.projetoLei = projetoLei;
    }

    public BigDecimal getDotacaoInicial() {
        return dotacaoInicial;
    }

    public void setDotacaoInicial(BigDecimal dotacaoInicial) {
        this.dotacaoInicial = dotacaoInicial;
    }

    public BigDecimal getDotacaoAtual() {
        return dotacaoAtual;
    }

    public void setDotacaoAtual(BigDecimal dotacaoAtual) {
        this.dotacaoAtual = dotacaoAtual;
    }

    public BigDecimal getEmpenhado() {
        return empenhado;
    }

    public void setEmpenhado(BigDecimal empenhado) {
        this.empenhado = empenhado;
    }

    public BigDecimal getLiquidado() {
        return liquidado;
    }

    public void setLiquidado(BigDecimal liquidado) {
        this.liquidado = liquidado;
    }

    public BigDecimal getPago() {
        return pago;
    }

    public void setPago(BigDecimal pago) {
        this.pago = pago;
    }
}
