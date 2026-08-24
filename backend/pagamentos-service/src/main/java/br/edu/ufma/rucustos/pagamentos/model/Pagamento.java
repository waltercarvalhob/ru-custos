package br.edu.ufma.rucustos.pagamentos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campus;

    @Column(name = "mes_referencia")
    private String mesReferencia;

    private String empresa;

    @Column(name = "numero_contrato")
    private String numeroContrato;

    @Column(name = "numero_processo_contratacao")
    private String numeroProcessoContratacao;

    private String modalidade;

    @Column(name = "numero_processo_pagamento")
    private String numeroProcessoPagamento;

    private String recurso;

    private String ne;

    @Column(name = "valor_ne", precision = 15, scale = 2)
    private BigDecimal valorNe;

    @Column(name = "numero_nf")
    private String numeroNf;

    @Column(name = "valor_nf", precision = 15, scale = 2)
    private BigDecimal valorNf;

    @Column(precision = 15, scale = 2)
    private BigDecimal glosa;

    @Column(name = "valor_pago", precision = 15, scale = 2)
    private BigDecimal valorPago;

    private String observacao;

    private Integer ano;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCampus() {
        return campus;
    }

    public void setCampus(String campus) {
        this.campus = campus;
    }

    public String getMesReferencia() {
        return mesReferencia;
    }

    public void setMesReferencia(String mesReferencia) {
        this.mesReferencia = mesReferencia;
    }

    public String getEmpresa() {
        return empresa;
    }

    public void setEmpresa(String empresa) {
        this.empresa = empresa;
    }

    public String getNumeroContrato() {
        return numeroContrato;
    }

    public void setNumeroContrato(String numeroContrato) {
        this.numeroContrato = numeroContrato;
    }

    public String getNumeroProcessoContratacao() {
        return numeroProcessoContratacao;
    }

    public void setNumeroProcessoContratacao(String numeroProcessoContratacao) {
        this.numeroProcessoContratacao = numeroProcessoContratacao;
    }

    public String getModalidade() {
        return modalidade;
    }

    public void setModalidade(String modalidade) {
        this.modalidade = modalidade;
    }

    public String getNumeroProcessoPagamento() {
        return numeroProcessoPagamento;
    }

    public void setNumeroProcessoPagamento(String numeroProcessoPagamento) {
        this.numeroProcessoPagamento = numeroProcessoPagamento;
    }

    public String getRecurso() {
        return recurso;
    }

    public void setRecurso(String recurso) {
        this.recurso = recurso;
    }

    public String getNe() {
        return ne;
    }

    public void setNe(String ne) {
        this.ne = ne;
    }

    public BigDecimal getValorNe() {
        return valorNe;
    }

    public void setValorNe(BigDecimal valorNe) {
        this.valorNe = valorNe;
    }

    public String getNumeroNf() {
        return numeroNf;
    }

    public void setNumeroNf(String numeroNf) {
        this.numeroNf = numeroNf;
    }

    public BigDecimal getValorNf() {
        return valorNf;
    }

    public void setValorNf(BigDecimal valorNf) {
        this.valorNf = valorNf;
    }

    public BigDecimal getGlosa() {
        return glosa;
    }

    public void setGlosa(BigDecimal glosa) {
        this.glosa = glosa;
    }

    public BigDecimal getValorPago() {
        return valorPago;
    }

    public void setValorPago(BigDecimal valorPago) {
        this.valorPago = valorPago;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }
}
