package br.edu.ufma.rucustos.pagamentos.repository;

import br.edu.ufma.rucustos.pagamentos.model.PagamentoAuxilio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PagamentoAuxilioRepository
        extends JpaRepository<PagamentoAuxilio, Long>, JpaSpecificationExecutor<PagamentoAuxilio> {
}
