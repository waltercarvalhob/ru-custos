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

@Entity
@Table(name = "empenhos")
public class Empenho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "contrato_id", nullable = false)
    private Contrato contrato;

    @Column(name = "numero_ne")
    private String numeroNe;

    @Column(name = "saldo_empenho", precision = 15, scale = 2)
    private BigDecimal saldoEmpenho;

    @Column(name = "saldo_ne_2025_informativo", precision = 15, scale = 2)
    private BigDecimal saldoNe2025Informativo;

    private Integer ano;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Contrato getContrato() {
        return contrato;
    }

    public void setContrato(Contrato contrato) {
        this.contrato = contrato;
    }

    public String getNumeroNe() {
        return numeroNe;
    }

    public void setNumeroNe(String numeroNe) {
        this.numeroNe = numeroNe;
    }

    public BigDecimal getSaldoEmpenho() {
        return saldoEmpenho;
    }

    public void setSaldoEmpenho(BigDecimal saldoEmpenho) {
        this.saldoEmpenho = saldoEmpenho;
    }

    public BigDecimal getSaldoNe2025Informativo() {
        return saldoNe2025Informativo;
    }

    public void setSaldoNe2025Informativo(BigDecimal saldoNe2025Informativo) {
        this.saldoNe2025Informativo = saldoNe2025Informativo;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }
}
