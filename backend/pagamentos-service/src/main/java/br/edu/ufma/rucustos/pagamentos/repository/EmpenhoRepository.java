package br.edu.ufma.rucustos.pagamentos.repository;

import br.edu.ufma.rucustos.pagamentos.model.Empenho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmpenhoRepository extends JpaRepository<Empenho, Long> {

    List<Empenho> findBySetor(String setor);
}
