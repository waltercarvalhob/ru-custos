package br.edu.ufma.rucustos.contratos.repository;

import br.edu.ufma.rucustos.contratos.model.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    List<Contrato> findByCampusId(Long campusId);

    @Query("SELECT COALESCE(SUM(c.valorContratual), 0) FROM Contrato c")
    BigDecimal sumValorContratual();

    @Query("SELECT COALESCE(SUM(c.valorUtilizado), 0) FROM Contrato c")
    BigDecimal sumValorUtilizado();

    @Query("SELECT COALESCE(SUM(c.saldo), 0) FROM Contrato c")
    BigDecimal sumSaldo();
}
