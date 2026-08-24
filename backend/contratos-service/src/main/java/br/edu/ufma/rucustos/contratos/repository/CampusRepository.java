package br.edu.ufma.rucustos.contratos.repository;

import br.edu.ufma.rucustos.contratos.model.Campus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusRepository extends JpaRepository<Campus, Long> {

    boolean existsByNome(String nome);
}
