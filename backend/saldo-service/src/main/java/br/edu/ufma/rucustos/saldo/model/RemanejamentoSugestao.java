package br.edu.ufma.rucustos.saldo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "remanejamento_sugestoes")
public class RemanejamentoSugestao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private CategoriaRemanejamento categoria;

    @NotNull
    private BigDecimal valorSugerido;

    private String observacao;

    private String mesReferencia;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CategoriaRemanejamento getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaRemanejamento categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getValorSugerido() {
        return valorSugerido;
    }

    public void setValorSugerido(BigDecimal valorSugerido) {
        this.valorSugerido = valorSugerido;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getMesReferencia() {
        return mesReferencia;
    }

    public void setMesReferencia(String mesReferencia) {
        this.mesReferencia = mesReferencia;
    }
}
