package br.edu.ufma.rucustos.previsoes.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "execucoes_mensais")
public class ExecucaoMensal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "contrato_previsao_id", nullable = false)
    private ContratoPrevisao contratoPrevisao;

    @NotNull
    @Column(name = "mes_referencia")
    private LocalDate mesReferencia;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TipoExecucao tipo;

    @NotNull
    private BigDecimal valor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ContratoPrevisao getContratoPrevisao() {
        return contratoPrevisao;
    }

    public void setContratoPrevisao(ContratoPrevisao contratoPrevisao) {
        this.contratoPrevisao = contratoPrevisao;
    }

    public LocalDate getMesReferencia() {
        return mesReferencia;
    }

    public void setMesReferencia(LocalDate mesReferencia) {
        this.mesReferencia = mesReferencia;
    }

    public TipoExecucao getTipo() {
        return tipo;
    }

    public void setTipo(TipoExecucao tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}
