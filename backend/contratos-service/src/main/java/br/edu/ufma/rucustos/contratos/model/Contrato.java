package br.edu.ufma.rucustos.contratos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contratos")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "campus_id", nullable = false)
    private Campus campus;

    private String empresa;

    @Column(name = "numero_contrato")
    private String numeroContrato;

    @Column(name = "processo_contratacao")
    private String processoContratacao;

    @Column(name = "valor_contratual", precision = 15, scale = 2)
    private BigDecimal valorContratual;

    @Column(name = "valor_utilizado", precision = 15, scale = 2)
    private BigDecimal valorUtilizado;

    @Column(precision = 15, scale = 2)
    private BigDecimal saldo;

    @Column(name = "vigencia_fim")
    private LocalDate vigenciaFim;

    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Campus getCampus() {
        return campus;
    }

    public void setCampus(Campus campus) {
        this.campus = campus;
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

    public String getProcessoContratacao() {
        return processoContratacao;
    }

    public void setProcessoContratacao(String processoContratacao) {
        this.processoContratacao = processoContratacao;
    }

    public BigDecimal getValorContratual() {
        return valorContratual;
    }

    public void setValorContratual(BigDecimal valorContratual) {
        this.valorContratual = valorContratual;
    }

    public BigDecimal getValorUtilizado() {
        return valorUtilizado;
    }

    public void setValorUtilizado(BigDecimal valorUtilizado) {
        this.valorUtilizado = valorUtilizado;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public LocalDate getVigenciaFim() {
        return vigenciaFim;
    }

    public void setVigenciaFim(LocalDate vigenciaFim) {
        this.vigenciaFim = vigenciaFim;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
