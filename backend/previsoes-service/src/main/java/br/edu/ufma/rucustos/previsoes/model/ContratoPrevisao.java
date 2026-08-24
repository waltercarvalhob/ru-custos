package br.edu.ufma.rucustos.previsoes.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contratos_previsao")
public class ContratoPrevisao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String favorecido;

    @Column(name = "numero_contrato")
    private String numeroContrato;

    @Column(name = "vigencia_inicio")
    private LocalDate vigenciaInicio;

    @Column(name = "vigencia_fim")
    private LocalDate vigenciaFim;

    @Column(name = "plano_interno")
    private String planoInterno;

    @Column(name = "setor_sipac")
    private String setorSipac;

    private String objeto;

    @NotNull
    @Column(name = "valor_contrato")
    private BigDecimal valorContrato;

    @Column(name = "numero_ne")
    private String numeroNe;

    @NotNull
    private BigDecimal empenhado;

    @Column(name = "processo_sei")
    private String processoSei;

    /**
     * Marcacao manual (S/N na planilha original) indicando se a sobra de empenho deste contrato
     * pode ser anulada e reaproveitada para cobrir o reforco de outros contratos deficitarios.
     */
    @Column(name = "sobra_aproveitavel")
    private boolean sobraAproveitavel = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFavorecido() {
        return favorecido;
    }

    public void setFavorecido(String favorecido) {
        this.favorecido = favorecido;
    }

    public String getNumeroContrato() {
        return numeroContrato;
    }

    public void setNumeroContrato(String numeroContrato) {
        this.numeroContrato = numeroContrato;
    }

    public LocalDate getVigenciaInicio() {
        return vigenciaInicio;
    }

    public void setVigenciaInicio(LocalDate vigenciaInicio) {
        this.vigenciaInicio = vigenciaInicio;
    }

    public LocalDate getVigenciaFim() {
        return vigenciaFim;
    }

    public void setVigenciaFim(LocalDate vigenciaFim) {
        this.vigenciaFim = vigenciaFim;
    }

    public String getPlanoInterno() {
        return planoInterno;
    }

    public void setPlanoInterno(String planoInterno) {
        this.planoInterno = planoInterno;
    }

    public String getSetorSipac() {
        return setorSipac;
    }

    public void setSetorSipac(String setorSipac) {
        this.setorSipac = setorSipac;
    }

    public String getObjeto() {
        return objeto;
    }

    public void setObjeto(String objeto) {
        this.objeto = objeto;
    }

    public BigDecimal getValorContrato() {
        return valorContrato;
    }

    public void setValorContrato(BigDecimal valorContrato) {
        this.valorContrato = valorContrato;
    }

    public String getNumeroNe() {
        return numeroNe;
    }

    public void setNumeroNe(String numeroNe) {
        this.numeroNe = numeroNe;
    }

    public BigDecimal getEmpenhado() {
        return empenhado;
    }

    public void setEmpenhado(BigDecimal empenhado) {
        this.empenhado = empenhado;
    }

    public String getProcessoSei() {
        return processoSei;
    }

    public void setProcessoSei(String processoSei) {
        this.processoSei = processoSei;
    }

    public boolean isSobraAproveitavel() {
        return sobraAproveitavel;
    }

    public void setSobraAproveitavel(boolean sobraAproveitavel) {
        this.sobraAproveitavel = sobraAproveitavel;
    }
}
