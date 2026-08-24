package br.edu.ufma.rucustos.contratos.repository;

import br.edu.ufma.rucustos.contratos.model.Empenho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmpenhoRepository extends JpaRepository<Empenho, Long> {

    List<Empenho> findByContratoId(Long contratoId);
}
